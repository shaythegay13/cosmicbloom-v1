require('dotenv').config();
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Charity = require('../models/Charity');
const fs = require('fs');

/**
 * LocatedMap Widget Scraper for ACGA
 * 
 * The ACGA website uses a LocatedMap widget embedded in Wix.
 * This scraper specifically targets the LocatedMap API calls to extract garden data.
 * 
 * Strategy:
 * 1. Intercept all network requests to locatedmap.com
 * 2. Capture API responses containing garden/location data
 * 3. Parse the LocatedMap data format
 * 4. Extract coordinates, names, and details
 */

class LocatedMapScraper {
    constructor() {
        this.url = 'https://www.communitygarden.org/garden';
        this.gardens = [];
        this.browser = null;
        this.page = null;
        this.apiResponses = [];
    }

    async init() {
        console.log('🚀 Launching browser to intercept LocatedMap API...\n');
        
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials'
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Enable request interception
        await this.page.setRequestInterception(true);
        
        // Intercept requests
        this.page.on('request', request => {
            const url = request.url();
            
            // Log LocatedMap requests
            if (url.includes('locatedmap') || url.includes('location') || url.includes('marker')) {
                console.log('📡 LocatedMap Request:', url);
            }
            
            request.continue();
        });

        // Capture responses
        this.page.on('response', async response => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';
            
            // Capture LocatedMap API responses
            if (url.includes('locatedmap') || url.includes('api')) {
                try {
                    if (contentType.includes('application/json')) {
                        const data = await response.json();
                        this.apiResponses.push({ url, data });
                        console.log('📥 Captured LocatedMap response:', url);
                        console.log('   Data keys:', Object.keys(data).join(', '));
                    } else if (contentType.includes('text')) {
                        const text = await response.text();
                        if (text.includes('location') || text.includes('marker') || text.includes('lat')) {
                            console.log('📥 Captured text response with location data');
                            this.apiResponses.push({ url, data: text });
                        }
                    }
                } catch (e) {
                    // Response already consumed or not parseable
                }
            }
        });
    }

    async navigateAndWait() {
        console.log('🗺️  Navigating to ACGA garden map...\n');
        
        await this.page.goto(this.url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        console.log('✅ Page loaded\n');
        console.log('⏳ Waiting for LocatedMap widget to load...\n');
        
        // Wait for the LocatedMap iframe
        await this.page.waitForTimeout(10000);
        
        // Try to interact with the map to trigger data loading
        console.log('🖱️  Attempting to interact with map...\n');
        
        try {
            // Scroll to map
            await this.page.evaluate(() => {
                const iframe = document.querySelector('iframe[src*="locatedmap"]');
                if (iframe) {
                    iframe.scrollIntoView();
                }
            });
            
            await this.page.waitForTimeout(3000);
            
            // Try to zoom out to load more markers
            await this.page.keyboard.press('Minus');
            await this.page.waitForTimeout(2000);
            await this.page.keyboard.press('Minus');
            await this.page.waitForTimeout(2000);
            
        } catch (error) {
            console.log('⚠️  Could not interact with map');
        }
    }

    async extractFromIframe() {
        console.log('🔍 Analyzing LocatedMap iframe...\n');
        
        const frames = this.page.frames();
        
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const url = frame.url();
            
            if (url.includes('locatedmap')) {
                console.log(`✅ Found LocatedMap iframe: ${url}\n`);
                
                try {
                    // Try to extract data from iframe's window object
                    const iframeData = await frame.evaluate(() => {
                        const data = {
                            locations: [],
                            markers: [],
                            windowKeys: Object.keys(window)
                        };
                        
                        // Check common variable names
                        if (window.locations) data.locations = window.locations;
                        if (window.markers) data.markers = window.markers;
                        if (window.mapData) data.mapData = window.mapData;
                        if (window.pins) data.pins = window.pins;
                        if (window.points) data.points = window.points;
                        
                        // Try to find data in localStorage
                        try {
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                const value = localStorage.getItem(key);
                                if (value && (value.includes('lat') || value.includes('location'))) {
                                    data[`localStorage_${key}`] = JSON.parse(value);
                                }
                            }
                        } catch (e) {}
                        
                        return data;
                    });
                    
                    console.log('📊 Iframe data keys:', Object.keys(iframeData).join(', '));
                    
                    if (iframeData.locations && iframeData.locations.length > 0) {
                        console.log(`✅ Found ${iframeData.locations.length} locations in iframe!`);
                        this.gardens.push(...iframeData.locations);
                    }
                    
                    if (iframeData.markers && iframeData.markers.length > 0) {
                        console.log(`✅ Found ${iframeData.markers.length} markers in iframe!`);
                        this.gardens.push(...iframeData.markers);
                    }
                    
                } catch (error) {
                    console.log(`⚠️  Could not access iframe ${i + 1}: ${error.message}`);
                }
            }
        }
    }

    async extractFromAPIResponses() {
        console.log(`\n📊 Analyzing ${this.apiResponses.length} API responses...\n`);
        
        this.apiResponses.forEach(({ url, data }) => {
            console.log(`\n🔍 Analyzing: ${url}`);
            
            if (typeof data === 'string') {
                // Try to parse as JSON
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    // Not JSON, skip
                    return;
                }
            }
            
            // Recursively search for garden data
            const gardens = this.findGardenData(data);
            if (gardens.length > 0) {
                console.log(`✅ Found ${gardens.length} gardens in this response!`);
                this.gardens.push(...gardens);
            }
        });
    }

    findGardenData(obj, depth = 0) {
        if (depth > 10) return []; // Prevent infinite recursion
        
        const gardens = [];
        
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                if (this.looksLikeGarden(item)) {
                    gardens.push(item);
                } else {
                    gardens.push(...this.findGardenData(item, depth + 1));
                }
            });
        } else if (obj && typeof obj === 'object') {
            // Check if this object is a garden
            if (this.looksLikeGarden(obj)) {
                gardens.push(obj);
            }
            
            // Check all properties
            Object.values(obj).forEach(value => {
                gardens.push(...this.findGardenData(value, depth + 1));
            });
        }
        
        return gardens;
    }

    looksLikeGarden(obj) {
        if (!obj || typeof obj !== 'object') return false;
        
        // Check if it has coordinates
        const hasLat = obj.lat !== undefined || obj.latitude !== undefined || 
                      (obj.coordinates && obj.coordinates.lat !== undefined) ||
                      (obj.location && obj.location.lat !== undefined);
        
        const hasLng = obj.lng !== undefined || obj.longitude !== undefined ||
                      (obj.coordinates && obj.coordinates.lng !== undefined) ||
                      (obj.location && obj.location.lng !== undefined);
        
        // Check if it has a name or title
        const hasName = obj.name || obj.title || obj.label;
        
        return (hasLat && hasLng) || (hasName && (hasLat || hasLng));
    }

    normalizeGardenData(rawData) {
        const lat = parseFloat(
            rawData.lat || rawData.latitude || 
            rawData.coordinates?.lat || rawData.location?.lat || 0
        );
        
        const lng = parseFloat(
            rawData.lng || rawData.longitude || 
            rawData.coordinates?.lng || rawData.location?.lng || 0
        );
        
        if (!lat || !lng) return null;
        
        const name = rawData.name || rawData.title || rawData.label || 'Community Garden';
        
        return {
            name,
            type: 'community_garden',
            description: rawData.description || rawData.details || rawData.info || 
                        `Community garden located at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            location: {
                address: rawData.address || rawData.street || '',
                city: rawData.city || '',
                state: rawData.state || rawData.province || '',
                zipCode: rawData.zip || rawData.zipCode || rawData.postalCode || '',
                country: rawData.country || 'USA',
                coordinates: { lat, lng }
            },
            contact: {
                email: rawData.email || '',
                phone: rawData.phone || '',
                website: rawData.website || rawData.url || ''
            },
            verified: true,
            acgaAffiliated: true,
            acgaId: rawData.id || null
        };
    }

    processGardens() {
        console.log(`\n🔄 Processing ${this.gardens.length} raw garden entries...\n`);
        
        const normalized = this.gardens
            .map(g => this.normalizeGardenData(g))
            .filter(g => g !== null);
        
        // Deduplicate
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

    async saveToDatabase(gardens) {
        try {
            console.log('💾 Connecting to MongoDB...\n');
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('✅ Connected to MongoDB\n');
            
            const deleteResult = await Charity.deleteMany({});
            console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing charities\n`);
            
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

    saveToJSON(gardens, filename = 'locatedmap-gardens.json') {
        console.log(`💾 Saving gardens to ${filename}...\n`);
        fs.writeFileSync(filename, JSON.stringify(gardens, null, 2));
        console.log(`✅ Saved ${gardens.length} gardens to JSON file\n`);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🗺️  LOCATEDMAP WIDGET SCRAPER FOR ACGA');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const scraper = new LocatedMapScraper();
    
    try {
        await scraper.init();
        await scraper.navigateAndWait();
        await scraper.extractFromIframe();
        await scraper.extractFromAPIResponses();
        
        const processedGardens = scraper.processGardens();
        
        if (processedGardens.length === 0) {
            console.log('\n⚠️  No gardens extracted from LocatedMap widget\n');
            console.log('💡 The widget may require:');
            console.log('   1. User interaction to load data');
            console.log('   2. Authentication/API key');
            console.log('   3. Different extraction method\n');
            console.log('📝 Saved debug files:');
            console.log('   - API responses logged above');
            console.log('   - Check browser console for errors\n');
        } else {
            scraper.saveToJSON(processedGardens);
            await scraper.saveToDatabase(processedGardens);
            
            console.log('═══════════════════════════════════════════════════════════');
            console.log('✅ SUCCESS!');
            console.log('═══════════════════════════════════════════════════════════\n');
            console.log(`Total gardens: ${processedGardens.length}\n`);
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
    } finally {
        await scraper.close();
    }
    
    process.exit(0);
}

if (require.main === module) {
    main();
}

module.exports = LocatedMapScraper;
