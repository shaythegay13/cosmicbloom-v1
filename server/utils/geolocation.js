/**
 * Geolocation utilities for finding nearest community gardens
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles (use 6371 for kilometers)
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const distance = R * c;
    
    return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Find nearest gardens to a given location
 * @param {Array} gardens - Array of garden objects with location.coordinates
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Array} Sorted array of gardens with distance
 */
function findNearestGardens(gardens, userLat, userLng, limit = 10) {
    // Calculate distance for each garden
    const gardensWithDistance = gardens.map(garden => {
        const gardenLat = garden.location.coordinates.lat;
        const gardenLng = garden.location.coordinates.lng;
        
        const distance = calculateDistance(userLat, userLng, gardenLat, gardenLng);
        
        return {
            ...garden.toObject ? garden.toObject() : garden,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            distanceUnit: 'miles'
        };
    });
    
    // Sort by distance (closest first)
    gardensWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Return top N results
    return gardensWithDistance.slice(0, limit);
}

/**
 * Find gardens within a radius
 * @param {Array} gardens - Array of garden objects
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} radiusMiles - Search radius in miles
 * @returns {Array} Gardens within radius, sorted by distance
 */
function findGardensInRadius(gardens, userLat, userLng, radiusMiles) {
    const gardensWithDistance = gardens.map(garden => {
        const gardenLat = garden.location.coordinates.lat;
        const gardenLng = garden.location.coordinates.lng;
        
        const distance = calculateDistance(userLat, userLng, gardenLat, gardenLng);
        
        return {
            ...garden.toObject ? garden.toObject() : garden,
            distance: Math.round(distance * 10) / 10,
            distanceUnit: 'miles'
        };
    });
    
    // Filter by radius
    const gardensInRadius = gardensWithDistance.filter(g => g.distance <= radiusMiles);
    
    // Sort by distance
    gardensInRadius.sort((a, b) => a.distance - b.distance);
    
    return gardensInRadius;
}

/**
 * Get user's approximate location from IP (requires external service)
 * This is a placeholder - you'd use a service like ipapi.co or ip-api.com
 * @param {string} ip - User's IP address
 * @returns {Promise<Object>} Location data
 */
async function getLocationFromIP(ip) {
    // This would call an IP geolocation service
    // For now, return a default location
    return {
        lat: 40.7128,
        lng: -74.0060,
        city: 'New York',
        state: 'NY',
        country: 'USA'
    };
}

/**
 * Geocode an address to coordinates (requires external service)
 * This is a placeholder - you'd use Google Maps Geocoding API or similar
 * @param {string} address - Full address string
 * @returns {Promise<Object>} Coordinates
 */
async function geocodeAddress(address) {
    // This would call a geocoding service
    // For now, return null
    return null;
}

module.exports = {
    calculateDistance,
    findNearestGardens,
    findGardensInRadius,
    getLocationFromIP,
    geocodeAddress
};
