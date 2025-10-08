require('dotenv').config();
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Charity = require('../models/Charity');
const fs = require('fs');

/**
 * Comprehensive ACGA Garden Scraper
 * 
 * This scraper extracts ALL community gardens from the ACGA map.
 * The ACGA website uses an embedded map that loads garden data dynamically.
 * 
 * Strategy:
 * 1. Launch headless browser with Puppeteer
 * 2. Navigate to ACGA garden map page
 * 3. Wait for map to fully load
 * 4. Intercept network requests to capture garden data
 * 5. Extract data from map markers/API calls
 * 6. Parse and normalize garden information
 * 7. Save to MongoDB database
 */

class ComprehensiveACGAScraper {
    constructor() {
        this.url = 'https://www.communitygarden.org/garden';
        this.gardens = [];
        this.browser = null;
        this.page = null;
        this.networkData = [];
    }

    /**
     * Initialize Puppeteer with network interception
     */
    async init() {
        console.log('🚀 Launching browser with network monitoring...\n');
        
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set viewport for full map visibility
        await this.page.setViewport({ width: 1920, height: 1080 });
        
        // Set realistic user agent
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Enable request interception to capture API calls
        await this.page.setRequestInterception(true);
        
        // Intercept network requests
        this.page.on('request', request => {
            const url = request.url();
            
            // Log API calls that might contain garden data
            if (url.includes('api') || url.includes('json') || url.includes('garden') || url.includes('map')) {
                console.log('📡 API Request:', url);
            }
            
            request.continue();
        });

        // Capture network responses
        this.page.on('response', async response => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';
            
            // Capture JSON responses that might contain garden data
            if (contentType.includes('application/json') || url.includes('garden') || url.includes('location')) {
                try {
                    const data = await response.json();
                    this.networkData.push({ url, data });
                    console.log('📥 Captured JSON response from:', url);
                } catch (e) {
                    // Not JSON or already consumed
                }
            }
        });
    }

    /**
     * Navigate to ACGA map and wait for it to load
     */
    async navigateAndWaitForMap() {
        console.log('🗺️  Navigating to ACGA garden map...\n');
        
        await this.page.goto(this.url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('✅ Page loaded\n');

        // Wait for map container
        console.log('⏳ Waiting for map to load...\n');
        
        try {
            // Try different selectors for map containers
            await this.page.waitForSelector('iframe, [class*="map"], [id*="map"], [class*="Map"]', {
                timeout: 15000
            });
            console.log('✅ Map container found\n');
        } catch (error) {
            console.log('⚠️  Map container not found with standard selectors\n');
        }

        // Give extra time for map markers to load
        console.log('⏳ Waiting for map markers to load...\n');
        await this.page.waitForTimeout(5000);
    }

    /**
     * Extract garden data from page
     */
    async extractGardenData() {
        console.log('🔍 Extracting garden data from page...\n');

        // Method 1: Check for iframes (common for embedded maps)
        const frames = this.page.frames();
        console.log(`Found ${frames.length} frame(s) on page\n`);

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            console.log(`Analyzing frame ${i + 1}: ${frame.url()}\n`);
            
            try {
                // Try to extract data from iframe
                const frameData = await frame.evaluate(() => {
                    const data = [];
                    
                    // Look for map markers
                    const markers = document.querySelectorAll('[class*="marker"], [class*="pin"], [data-lat], [data-lng]');
                    markers.forEach(marker => {
                        const gardenData = {
                            name: marker.getAttribute('data-name') || marker.getAttribute('title') || '',
                            lat: marker.getAttribute('data-lat') || marker.getAttribute('lat') || '',
                            lng: marker.getAttribute('data-lng') || marker.getAttribute('lng') || '',
                            address: marker.getAttribute('data-address') || '',
                            city: marker.getAttribute('data-city') || '',
                            state: marker.getAttribute('data-state') || ''
                        };
                        
                        if (gardenData.lat && gardenData.lng) {
                            data.push(gardenData);
                        }
                    });
                    
                    return data;
                });

                if (frameData.length > 0) {
                    console.log(`✅ Found ${frameData.length} gardens in frame ${i + 1}\n`);
                    this.gardens.push(...frameData);
                }
            } catch (error) {
                console.log(`⚠️  Could not access frame ${i + 1}: ${error.message}\n`);
            }
        }

        // Method 2: Extract from main page JavaScript
        const pageData = await this.page.evaluate(() => {
            const gardens = [];
            
            // Check window object for garden data
            if (window.gardens) gardens.push(...window.gardens);
            if (window.gardenData) gardens.push(...window.gardenData);
            if (window.locations) gardens.push(...window.locations);
            if (window.markers) gardens.push(...window.markers);
            
            // Look for data in script tags
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                const content = script.textContent;
                
                // Look for JSON arrays with garden data
                const jsonArrayMatch = content.match(/\[[\s\S]*?\{[\s\S]*?"name"[\s\S]*?\}[\s\S]*?\]/g);
                if (jsonArrayMatch) {
                    jsonArrayMatch.forEach(match => {
                        try {
                            const parsed = JSON.parse(match);
                            if (Array.isArray(parsed)) {
                                gardens.push(...parsed);
                            }
                        } catch (e) {
                            // Not valid JSON
                        }
                    });
                }
            });
            
            return gardens;
        });

        if (pageData.length > 0) {
            console.log(`✅ Found ${pageData.length} gardens in page JavaScript\n`);
            this.gardens.push(...pageData);
        }

        // Method 3: Use captured network data
        console.log(`\n📊 Analyzing ${this.networkData.length} network responses...\n`);
        
        this.networkData.forEach(({ url, data }) => {
            if (Array.isArray(data)) {
                console.log(`✅ Found array with ${data.length} items in ${url}\n`);
                this.gardens.push(...data);
            } else if (data.gardens || data.locations || data.markers) {
                const gardenArray = data.gardens || data.locations || data.markers;
                console.log(`✅ Found ${gardenArray.length} gardens in response data\n`);
                this.gardens.push(...gardenArray);
            }
        });

        return this.gardens;
    }

    /**
     * Take screenshot for debugging
     */
    async takeScreenshot(filename = 'acga-map-full.png') {
        console.log(`📸 Taking screenshot: ${filename}\n`);
        await this.page.screenshot({ 
            path: filename,
            fullPage: true 
        });
    }

    /**
     * Save page HTML for analysis
     */
    async savePageHTML(filename = 'acga-page.html') {
        console.log(`💾 Saving page HTML: ${filename}\n`);
        const html = await this.page.content();
        fs.writeFileSync(filename, html);
    }

    /**
     * Normalize garden data to match our schema
     */
    normalizeGardenData(rawData) {
        // Handle various data formats
        const name = rawData.name || rawData.title || rawData.gardenName || 'Unknown Garden';
        const lat = parseFloat(rawData.lat || rawData.latitude || rawData.coordinates?.lat || 0);
        const lng = parseFloat(rawData.lng || rawData.longitude || rawData.coordinates?.lng || 0);
        
        // Skip if no valid coordinates
        if (!lat || !lng) {
            return null;
        }

        return {
            name: name,
            type: this.determineType(rawData),
            description: rawData.description || rawData.about || rawData.details || `Community garden in ${rawData.city || 'the area'}`,
            location: {
                address: rawData.address || rawData.street || '',
                city: rawData.city || '',
                state: rawData.state || rawData.province || '',
                zipCode: rawData.zip || rawData.zipCode || rawData.postalCode || '',
                country: rawData.country || 'USA',
                coordinates: { lat, lng }
            },
            contact: {
                email: rawData.email || rawData.contactEmail || '',
                phone: rawData.phone || rawData.telephone || '',
                website: rawData.website || rawData.url || rawData.link || ''
            },
            verified: true,
            acgaAffiliated: true,
            acgaId: rawData.id || rawData.gardenId || null
        };
    }

    /**
     * Determine garden type from data
     */
    determineType(data) {
        const name = (data.name || '').toLowerCase();
        const desc = (data.description || '').toLowerCase();
        const type = (data.type || '').toLowerCase();
        
        if (type.includes('farm') || name.includes('farm') || desc.includes('farm')) {
            return 'urban_farm';
        } else if (type.includes('initiative') || name.includes('initiative') || desc.includes('initiative')) {
            return 'agricultural_initiative';
        }
        return 'community_garden';
    }

    /**
     * Process and deduplicate gardens
     */
    processGardens() {
        console.log(`\n🔄 Processing ${this.gardens.length} raw garden entries...\n`);

        // Normalize all gardens
        const normalized = this.gardens
            .map(g => this.normalizeGardenData(g))
            .filter(g => g !== null);

        // Deduplicate by coordinates
        const unique = [];
        const seen = new Set();

        normalized.forEach(garden => {
            const key = `${garden.location.coordinates.lat.toFixed(4)},${garden.location.coordinates.lng.toFixed(4)}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(garden);
            }
        });

        console.log(`✅ Processed ${unique.length} unique gardens\n`);
        return unique;
    }

    /**
     * Save gardens to database
     */
    async saveToDatabase(gardens) {
        try {
            console.log('💾 Connecting to MongoDB...\n');
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Connected to MongoDB\n');

            // Clear existing charities
            const deleteResult = await Charity.deleteMany({});
            console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing charities\n`);

            // Insert new gardens
            const result = await Charity.insertMany(gardens);
            console.log(`✅ Saved ${result.length} community gardens to database\n`);

            return result;
        } catch (error) {
            console.error('❌ Error saving to database:', error);
            throw error;
        } finally {
            await mongoose.connection.close();
        }
    }

    /**
     * Save gardens to JSON file as backup
     */
    saveToJSON(gardens, filename = 'acga-gardens.json') {
        console.log(`💾 Saving gardens to ${filename}...\n`);
        fs.writeFileSync(filename, JSON.stringify(gardens, null, 2));
        console.log(`✅ Saved ${gardens.length} gardens to JSON file\n`);
    }

    /**
     * Close browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌱 ACGA COMPREHENSIVE COMMUNITY GARDEN SCRAPER');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const scraper = new ComprehensiveACGAScraper();

    try {
        // Initialize browser
        await scraper.init();

        // Navigate to map
        await scraper.navigateAndWaitForMap();

        // Take screenshot for debugging
        await scraper.takeScreenshot();

        // Save HTML for analysis
        await scraper.savePageHTML();

        // Extract garden data
        await scraper.extractGardenData();

        // Process and deduplicate
        const processedGardens = scraper.processGardens();

        if (processedGardens.length === 0) {
            console.log('\n⚠️  WARNING: No gardens were extracted!\n');
            console.log('The ACGA map likely uses one of these methods:');
            console.log('  1. Third-party mapping service (Google Maps, Mapbox, etc.)');
            console.log('  2. API that requires authentication');
            console.log('  3. Data loaded via complex JavaScript\n');
            console.log('📝 Next steps:');
            console.log('  1. Check acga-page.html for map implementation details');
            console.log('  2. Check acga-map-full.png to see what loaded');
            console.log('  3. Look for API endpoints in browser DevTools');
            console.log('  4. Contact ACGA for API access: info@communitygarden.org\n');
            console.log('💡 For now, use the curated garden list:');
            console.log('   npm run scrape-gardens\n');
        } else {
            // Save to JSON backup
            scraper.saveToJSON(processedGardens);

            // Save to database
            await scraper.saveToDatabase(processedGardens);

            // Display statistics
            console.log('═══════════════════════════════════════════════════════════');
            console.log('📊 SCRAPING RESULTS');
            console.log('═══════════════════════════════════════════════════════════\n');
            console.log(`Total gardens found: ${processedGardens.length}\n`);

            // Group by state
            const byState = {};
            processedGardens.forEach(g => {
                const state = g.location.state || 'Unknown';
                byState[state] = (byState[state] || 0) + 1;
            });

            console.log('Gardens by state:');
            Object.entries(byState)
                .sort((a, b) => b[1] - a[1])
                .forEach(([state, count]) => {
                    console.log(`  ${state}: ${count} garden(s)`);
                });

            console.log('\n✅ SUCCESS! All gardens saved to database\n');
            console.log(`💾 Backup saved to: acga-gardens.json\n`);
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
    } finally {
        await scraper.close();
    }

    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = ComprehensiveACGAScraper;
