const Charity = require('../models/Charity');

// Sample community gardens and urban farms
const sampleCharities = [
    {
        name: "Brooklyn Grange",
        type: "urban_farm",
        description: "The world's largest rooftop soil farms, growing over 50,000 lbs of organic produce annually.",
        location: {
            address: "37-18 Northern Blvd",
            city: "Long Island City",
            state: "NY",
            zipCode: "11101",
            country: "USA",
            coordinates: { lat: 40.7505, lng: -73.9295 }
        },
        contact: {
            email: "info@brooklyngrangefarm.com",
            website: "https://www.brooklyngrangefarm.com"
        },
        verified: true,
        images: []
    },
    {
        name: "Seattle Urban Farm Company",
        type: "urban_farm",
        description: "Building edible gardens throughout Seattle, promoting sustainable urban agriculture.",
        location: {
            address: "Various Locations",
            city: "Seattle",
            state: "WA",
            zipCode: "98101",
            country: "USA",
            coordinates: { lat: 47.6062, lng: -122.3321 }
        },
        contact: {
            email: "info@seattleurbanfarmco.com",
            website: "https://www.seattleurbanfarmco.com"
        },
        verified: true,
        images: []
    },
    {
        name: "South Central Community Garden",
        type: "community_garden",
        description: "A 14-acre urban farm in South Los Angeles providing fresh produce to the community.",
        location: {
            address: "4100 S Alameda St",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90058",
            country: "USA",
            coordinates: { lat: 34.0094, lng: -118.2340 }
        },
        contact: {
            email: "contact@scfarmersmarket.org"
        },
        verified: true,
        images: []
    },
    {
        name: "Growing Power",
        type: "agricultural_initiative",
        description: "National nonprofit organization supporting people from diverse backgrounds in the food system.",
        location: {
            address: "5500 W Silver Spring Dr",
            city: "Milwaukee",
            state: "WI",
            zipCode: "53218",
            country: "USA",
            coordinates: { lat: 43.0731, lng: -87.9712 }
        },
        contact: {
            email: "info@growingpower.org",
            website: "https://www.growingpower.org"
        },
        verified: true,
        images: []
    },
    {
        name: "Austin Community Gardens",
        type: "community_garden",
        description: "Network of community gardens providing fresh food and green spaces in Austin.",
        location: {
            address: "Various Locations",
            city: "Austin",
            state: "TX",
            zipCode: "78701",
            country: "USA",
            coordinates: { lat: 30.2672, lng: -97.7431 }
        },
        contact: {
            email: "gardens@austintexas.gov"
        },
        verified: true,
        images: []
    },
    {
        name: "Chicago Urban Agriculture",
        type: "urban_farm",
        description: "Transforming vacant lots into productive urban farms across Chicago.",
        location: {
            address: "Various Locations",
            city: "Chicago",
            state: "IL",
            zipCode: "60601",
            country: "USA",
            coordinates: { lat: 41.8781, lng: -87.6298 }
        },
        contact: {
            email: "info@chicagourbanag.org"
        },
        verified: true,
        images: []
    },
    {
        name: "Portland Community Gardens",
        type: "community_garden",
        description: "Over 50 community gardens managed by Portland Parks & Recreation.",
        location: {
            address: "Various Locations",
            city: "Portland",
            state: "OR",
            zipCode: "97201",
            country: "USA",
            coordinates: { lat: 45.5152, lng: -122.6784 }
        },
        contact: {
            email: "communitygardens@portlandoregon.gov",
            website: "https://www.portlandoregon.gov/parks/gardens"
        },
        verified: true,
        images: []
    },
    {
        name: "Boston Urban Gardeners",
        type: "community_garden",
        description: "Supporting community gardens and urban agriculture throughout Boston.",
        location: {
            address: "Various Locations",
            city: "Boston",
            state: "MA",
            zipCode: "02101",
            country: "USA",
            coordinates: { lat: 42.3601, lng: -71.0589 }
        },
        contact: {
            email: "info@bostonurbangardens.org"
        },
        verified: true,
        images: []
    },
    {
        name: "Denver Urban Gardens",
        type: "community_garden",
        description: "Supporting a network of community gardens across the Denver metro area.",
        location: {
            address: "1031 33rd St",
            city: "Denver",
            state: "CO",
            zipCode: "80205",
            country: "USA",
            coordinates: { lat: 39.7392, lng: -104.9903 }
        },
        contact: {
            email: "info@dug.org",
            website: "https://www.dug.org"
        },
        verified: true,
        images: []
    },
    {
        name: "Philadelphia Urban Creators",
        type: "urban_farm",
        description: "Youth-powered urban farm creating green spaces and opportunities in North Philadelphia.",
        location: {
            address: "2441 N 23rd St",
            city: "Philadelphia",
            state: "PA",
            zipCode: "19132",
            country: "USA",
            coordinates: { lat: 39.9872, lng: -75.1652 }
        },
        contact: {
            email: "info@urbancreators.org",
            website: "https://www.urbancreators.org"
        },
        verified: true,
        images: []
    }
];

async function seedCharities() {
    try {
        // Clear existing charities
        await Charity.deleteMany({});
        console.log('Cleared existing charities');

        // Insert sample charities
        const result = await Charity.insertMany(sampleCharities);
        console.log(`✅ Seeded ${result.length} community gardens and urban farms`);
        
        return result;
    } catch (error) {
        console.error('Error seeding charities:', error);
        throw error;
    }
}

module.exports = { seedCharities, sampleCharities };
