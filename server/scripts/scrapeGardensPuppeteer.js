require('dotenv').config();
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Charity = require('../models/Charity');

/**
 * Advanced Web Scraper for ACGA Community Garden Map
 * Uses Puppeteer to handle JavaScript-rendered content
 * 
 * The ACGA website uses an embedded map that loads data dynamically.
 * This scraper will:
 * 1. Launch a headless browser
 * 2. Navigate to the garden map page
 * 3. Wait for the map to load
 * 4. Extract garden data from the map markers
 * 5. Save to database
 */

class PuppeteerGardenScraper {
    constructor() {
        this.url = 'https://www.communitygarden.org/garden';
        this.gardens = [];
        this.browser = null;
        this.page = null;
    }

    /**
     * Initialize Puppeteer browser
     */
    async init() {
        console.log('Launching browser...');
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // Set viewport
        await this.page.setViewport({ width: 1920, height: 1080 });
        
        // Set user agent
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
    }

    /**
     * Navigate to the garden map page
     */
    async navigateToMap() {
        console.log('Navigating to ACGA garden map...');
        await this.page.goto(this.url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('Page loaded, waiting for map...');
        
        // Wait for map to load (adjust selector based on actual map implementation)
        try {
            await this.page.waitForSelector('iframe, [class*="map"], [id*="map"]', {
                timeout: 10000
            });
            console.log('Map container found!');
        } catch (error) {
            console.log('Map container not found, proceeding anyway...');
        }
    }

    /**
     * Extract garden data from the page
     */
    async extractGardenData() {
        console.log('Extracting garden data...');

        // Try to find iframe with map
        const frames = await this.page.frames();
        console.log(`Found ${frames.length} frames on page`);

        // Look for map data in page content
        const gardenData = await this.page.evaluate(() => {
            const gardens = [];
            
            // Try to find data in window object
            if (window.gardenData) {
                return window.gardenData;
            }
            
            // Try to find data in script tags
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                const content = script.textContent;
                if (content.includes('garden') || content.includes('location')) {
                    // Try to extract JSON
                    const jsonMatch = content.match(/\{[^{}]*"name"[^{}]*\}/g);
                    if (jsonMatch) {
                        jsonMatch.forEach(match => {
                            try {
                                gardens.push(JSON.parse(match));
                            } catch (e) {
                                // Not valid JSON
                            }
                        });
                    }
                }
            });
            
            return gardens;
        });

        console.log(`Extracted ${gardenData.length} gardens from page`);
        
        // If we found data, process it
        if (gardenData.length > 0) {
            this.gardens = gardenData.map(g => this.normalizeGardenData(g));
        }

        return this.gardens;
    }

    /**
     * Normalize garden data to match our schema
     */
    normalizeGardenData(rawData) {
        return {
            name: rawData.name || rawData.title || 'Unknown Garden',
            type: this.determineType(rawData),
            description: rawData.description || rawData.about || 'Community garden',
            location: {
                address: rawData.address || rawData.street || '',
                city: rawData.city || '',
                state: rawData.state || rawData.province || '',
                zipCode: rawData.zip || rawData.zipCode || rawData.postalCode || '',
                country: rawData.country || 'USA',
                coordinates: {
                    lat: parseFloat(rawData.lat || rawData.latitude || 0),
                    lng: parseFloat(rawData.lng || rawData.longitude || 0)
                }
            },
            contact: {
                email: rawData.email || '',
                phone: rawData.phone || '',
                website: rawData.website || rawData.url || ''
            },
            verified: true,
            acgaAffiliated: true
        };
    }

    /**
     * Determine garden type from data
     */
    determineType(data) {
        const name = (data.name || '').toLowerCase();
        const desc = (data.description || '').toLowerCase();
        
        if (name.includes('farm') || desc.includes('farm')) {
            return 'urban_farm';
        } else if (name.includes('initiative') || desc.includes('initiative')) {
            return 'agricultural_initiative';
        }
        return 'community_garden';
    }

    /**
     * Take screenshot for debugging
     */
    async takeScreenshot(filename = 'garden-map-screenshot.png') {
        await this.page.screenshot({ 
            path: filename,
            fullPage: true 
        });
        console.log(`Screenshot saved to ${filename}`);
    }

    /**
     * Close browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    /**
     * Save gardens to database
     */
    async saveToDatabase(gardens) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Connected to MongoDB');

            // Clear existing charities
            await Charity.deleteMany({});
            console.log('Cleared existing charities');

            // Insert new gardens
            const result = await Charity.insertMany(gardens);
            console.log(`✅ Saved ${result.length} community gardens to database`);

            return result;
        } catch (error) {
            console.error('Error saving to database:', error);
            throw error;
        } finally {
            await mongoose.connection.close();
        }
    }
}

// Main execution
async function main() {
    console.log('🌱 ACGA Community Garden Scraper (Puppeteer)\n');
    
    const scraper = new PuppeteerGardenScraper();

    try {
        // Initialize browser
        await scraper.init();

        // Navigate to map
        await scraper.navigateToMap();

        // Take screenshot for debugging
        await scraper.takeScreenshot();

        // Extract garden data
        const gardens = await scraper.extractGardenData();

        if (gardens.length === 0) {
            console.log('\n⚠️  No gardens extracted from dynamic content.');
            console.log('The map likely uses a third-party service (Google Maps, etc.)');
            console.log('that requires API access or manual data collection.\n');
            console.log('💡 Recommendation: Use the manual scraper (scrapeGardens.js)');
            console.log('   or contact ACGA for API access.\n');
        } else {
            // Save to database
            await scraper.saveToDatabase(gardens);
            console.log('\n✅ Successfully updated community garden database!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await scraper.close();
    }

    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = PuppeteerGardenScraper;
