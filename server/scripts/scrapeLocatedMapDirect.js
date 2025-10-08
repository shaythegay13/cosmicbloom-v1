require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Charity = require('../models/Charity');
const fs = require('fs');

/**
 * Direct LocatedMap API Scraper
 * 
 * The LocatedMap widget uses specific API endpoints to load marker data.
 * This scraper attempts to directly call those APIs.
 * 
 * From the iframe URL, we can extract:
 * - pageId: uyd05
 * - compId: comp-jtq3tiw8
 * 
 * We'll try to find the actual data API endpoint.
 */

class DirectLocatedMapScraper {
    constructor() {
        this.pageId = 'uyd05';
        this.compId = 'comp-jtq3tiw8';
        this.gardens = [];
    }

    async tryAPIEndpoints() {
        console.log('🔍 Attempting to find LocatedMap data API...\n');
        
        // Possible API endpoints based on common patterns
        const endpoints = [
            `https://app.locatedmap.com/api/locations?pageId=${this.pageId}`,
            `https://app.locatedmap.com/api/markers?pageId=${this.pageId}`,
            `https://app.locatedmap.com/api/data?pageId=${this.pageId}`,
            `https://app.locatedmap.com/api/map/${this.pageId}`,
            `https://app.locatedmap.com/data/${this.pageId}.json`,
            `https://api.locatedmap.com/locations/${this.pageId}`,
            `https://api.locatedmap.com/v1/locations?page=${this.pageId}`,
        ];

        for (const endpoint of endpoints) {
            console.log(`📡 Trying: ${endpoint}`);
            
            try {
                const response = await axios.get(endpoint, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json, text/plain, */*',
                        'Referer': 'https://www.communitygarden.org/garden'
                    },
                    timeout: 10000
                });

                if (response.data) {
                    console.log(`✅ Got response from: ${endpoint}`);
                    console.log(`   Status: ${response.status}`);
                    console.log(`   Data type: ${typeof response.data}`);
                    
                    if (Array.isArray(response.data)) {
                        console.log(`   Array length: ${response.data.length}`);
                        this.gardens.push(...response.data);
                    } else if (response.data.locations) {
                        console.log(`   Found locations: ${response.data.locations.length}`);
                        this.gardens.push(...response.data.locations);
                    } else if (response.data.markers) {
                        console.log(`   Found markers: ${response.data.markers.length}`);
                        this.gardens.push(...response.data.markers);
                    } else {
                        console.log(`   Data keys: ${Object.keys(response.data).join(', ')}`);
                        // Save for manual inspection
                        fs.writeFileSync(`locatedmap-response-${Date.now()}.json`, 
                            JSON.stringify(response.data, null, 2));
                    }
                }
            } catch (error) {
                if (error.response) {
                    console.log(`   ❌ ${error.response.status}: ${error.response.statusText}`);
                } else {
                    console.log(`   ❌ ${error.message}`);
                }
            }
            
            console.log('');
        }
    }

    async tryWixDataAPI() {
        console.log('🔍 Trying Wix Data API approach...\n');
        
        // The widget is embedded in Wix, so data might be in Wix's data collections
        const wixEndpoints = [
            'https://www.communitygarden.org/_api/v1/locations',
            'https://www.communitygarden.org/_api/v1/gardens',
            'https://www.communitygarden.org/_api/dynamicmodel',
        ];

        for (const endpoint of wixEndpoints) {
            console.log(`📡 Trying Wix API: ${endpoint}`);
            
            try {
                const response = await axios.get(endpoint, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });

                if (response.data) {
                    console.log(`✅ Got response!`);
                    fs.writeFileSync(`wix-response-${Date.now()}.json`, 
                        JSON.stringify(response.data, null, 2));
                }
            } catch (error) {
                console.log(`   ❌ ${error.message}`);
            }
            
            console.log('');
        }
    }

    async contactACGAForData() {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('💡 RECOMMENDATION: Contact ACGA Directly');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('The LocatedMap widget data is not publicly accessible via API.');
        console.log('The best approach is to contact ACGA directly:\n');
        
        console.log('📧 Email: info@communitygarden.org');
        console.log('🌐 Website: https://www.communitygarden.org');
        console.log('📍 Address: 1441 Woodmont Ln NW Suite 1400, Atlanta, GA 30318\n');
        
        console.log('What to request:');
        console.log('  1. API access to their garden database');
        console.log('  2. CSV/JSON export of all garden locations');
        console.log('  3. Partnership for your Farm & Give game\n');
        
        console.log('Your pitch:');
        console.log('  - 10% of all game revenue goes to community gardens');
        console.log('  - Help players discover gardens near them');
        console.log('  - Bring visibility and funding to ACGA members');
        console.log('  - Transparent impact tracking\n');
    }

    async manualDataCollection() {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🛠️  ALTERNATIVE: Manual Data Collection');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('Since automated scraping is not working, here are alternatives:\n');
        
        console.log('Option 1: Use ACGA Garden Submission Template');
        console.log('  - Download: https://www.communitygarden.org/_files/ugd/f96093_afdb7087e0104742ac506b7b53b51624.xlsx');
        console.log('  - Request bulk data from ACGA\n');
        
        console.log('Option 2: Manual Collection from Map');
        console.log('  - Visit: https://www.communitygarden.org/garden');
        console.log('  - Click each marker on the map');
        console.log('  - Copy garden information');
        console.log('  - Add to database manually\n');
        
        console.log('Option 3: Regional Garden Networks');
        console.log('  - Contact major city garden networks directly');
        console.log('  - Seattle P-Patch, Denver Urban Gardens, GreenThumb NYC, etc.');
        console.log('  - Request their member garden lists\n');
        
        console.log('Option 4: Use Our Curated List');
        console.log('  - We have 15 major ACGA-affiliated organizations');
        console.log('  - Run: npm run scrape-gardens');
        console.log('  - Expand gradually by adding more gardens\n');
    }

    normalizeGardenData(rawData) {
        const lat = parseFloat(rawData.lat || rawData.latitude || 0);
        const lng = parseFloat(rawData.lng || rawData.longitude || 0);
        
        if (!lat || !lng) return null;
        
        return {
            name: rawData.name || rawData.title || 'Community Garden',
            type: 'community_garden',
            description: rawData.description || `Community garden at ${lat}, ${lng}`,
            location: {
                address: rawData.address || '',
                city: rawData.city || '',
                state: rawData.state || '',
                zipCode: rawData.zipCode || '',
                country: 'USA',
                coordinates: { lat, lng }
            },
            contact: {
                email: rawData.email || '',
                phone: rawData.phone || '',
                website: rawData.website || ''
            },
            verified: true,
            acgaAffiliated: true
        };
    }

    async saveToDatabase(gardens) {
        if (gardens.length === 0) {
            console.log('⚠️  No gardens to save\n');
            return;
        }

        try {
            console.log('💾 Connecting to MongoDB...\n');
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('✅ Connected\n');
            
            await Charity.deleteMany({});
            const result = await Charity.insertMany(gardens);
            console.log(`✅ Saved ${result.length} gardens\n`);
            
            return result;
        } catch (error) {
            console.error('❌ Database error:', error.message);
        } finally {
            await mongoose.connection.close();
        }
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🗺️  DIRECT LOCATEDMAP API SCRAPER');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const scraper = new DirectLocatedMapScraper();
    
    try {
        // Try to find API endpoints
        await scraper.tryAPIEndpoints();
        await scraper.tryWixDataAPI();
        
        if (scraper.gardens.length > 0) {
            console.log(`\n✅ Found ${scraper.gardens.length} gardens!\n`);
            
            const normalized = scraper.gardens
                .map(g => scraper.normalizeGardenData(g))
                .filter(g => g !== null);
            
            await scraper.saveToDatabase(normalized);
        } else {
            console.log('\n❌ Could not access LocatedMap data via API\n');
            await scraper.contactACGAForData();
            await scraper.manualDataCollection();
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
    
    process.exit(0);
}

if (require.main === module) {
    main();
}

module.exports = DirectLocatedMapScraper;
