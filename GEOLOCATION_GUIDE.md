# 🌍 Geolocation & Nearest Garden Finder

## Overview

Your Farm & Give game now includes **geolocation-based garden discovery**! Players can find community gardens nearest to their location automatically.

---

## 🎯 New Features

### 1. **Nearest Garden API**
Find gardens closest to any location:
```
GET /api/charity/nearest?lat=40.7128&lng=-74.0060&limit=10
```

### 2. **Radius Search**
Find all gardens within a specific radius:
```
GET /api/charity/nearest?lat=40.7128&lng=-74.0060&radius=25
```

### 3. **Distance Calculation**
All results include distance in miles from user's location

---

## 🚀 How to Use

### Step 1: Get User's Location

**In the browser (with user permission):**
```javascript
// Request user's location
navigator.geolocation.getCurrentPosition(
    (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Find nearest gardens
        findNearestGardens(lat, lng);
    },
    (error) => {
        console.error('Location access denied:', error);
        // Fall back to manual search
    }
);
```

### Step 2: Call the API

```javascript
async function findNearestGardens(lat, lng) {
    const response = await fetch(
        `/api/charity/nearest?lat=${lat}&lng=${lng}&limit=10`
    );
    const data = await response.json();
    
    console.log(`Found ${data.count} gardens nearby`);
    data.gardens.forEach(garden => {
        console.log(`${garden.name} - ${garden.distance} miles away`);
    });
}
```

### Step 3: Display Results

```javascript
// Show gardens sorted by distance
data.gardens.forEach(garden => {
    const gardenCard = `
        <div class="garden-card">
            <h3>${garden.name}</h3>
            <p>📍 ${garden.distance} miles away</p>
            <p>${garden.location.city}, ${garden.location.state}</p>
            <button onclick="selectGarden('${garden._id}')">
                Support This Garden
            </button>
        </div>
    `;
    // Add to page
});
```

---

## 📡 API Reference

### Find Nearest Gardens

**Endpoint:** `GET /api/charity/nearest`

**Query Parameters:**
- `lat` (required) - User's latitude (-90 to 90)
- `lng` (required) - User's longitude (-180 to 180)
- `limit` (optional) - Max results to return (default: 10)
- `radius` (optional) - Search radius in miles

**Example Request:**
```
GET /api/charity/nearest?lat=47.6062&lng=-122.3321&limit=5
```

**Example Response:**
```json
{
  "userLocation": {
    "lat": 47.6062,
    "lng": -122.3321
  },
  "count": 5,
  "gardens": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Seattle P-Patch Community Gardens",
      "type": "community_garden",
      "description": "Seattle's largest community gardening program",
      "location": {
        "address": "Various Locations",
        "city": "Seattle",
        "state": "WA",
        "zipCode": "98101",
        "country": "USA",
        "coordinates": {
          "lat": 47.6062,
          "lng": -122.3321
        }
      },
      "contact": {
        "email": "ppatch@seattle.gov",
        "website": "https://www.seattle.gov/..."
      },
      "verified": true,
      "acgaAffiliated": true,
      "totalReceived": 1250.50,
      "supporters": 45,
      "distance": 0.2,
      "distanceUnit": "miles"
    },
    {
      "name": "Portland Community Gardens",
      "distance": 145.3,
      "distanceUnit": "miles"
      // ... more fields
    }
  ]
}
```

### Find Gardens Within Radius

**Example Request:**
```
GET /api/charity/nearest?lat=40.7128&lng=-74.0060&radius=50
```

Returns all gardens within 50 miles of New York City.

---

## 🎮 Frontend Integration

### Update UI.js

Add geolocation support to the charity modal:

```javascript
// In client/js/ui.js

async loadNearbyGardens() {
    // Check if geolocation is available
    if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        return;
    }

    // Request user's location
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            try {
                // Fetch nearest gardens
                const response = await fetch(
                    `/api/charity/nearest?lat=${lat}&lng=${lng}&limit=20`
                );
                const data = await response.json();
                
                // Display results
                this.renderNearbyGardens(data.gardens);
            } catch (error) {
                console.error('Error fetching nearby gardens:', error);
            }
        },
        (error) => {
            console.error('Location access denied:', error);
            // Fall back to manual search
        }
    );
}

renderNearbyGardens(gardens) {
    const container = document.getElementById('charity-list');
    container.innerHTML = '<h3>🌍 Gardens Near You</h3>';
    
    gardens.forEach(garden => {
        const item = document.createElement('div');
        item.className = 'charity-item';
        item.innerHTML = `
            <h4>${garden.name}</h4>
            <p>📍 ${garden.distance} miles away</p>
            <p>${garden.location.city}, ${garden.location.state}</p>
            <p>${garden.description}</p>
            <p><strong>💚 ${garden.supporters} supporters</strong> | 
               <strong>$${garden.totalReceived.toFixed(2)} received</strong></p>
        `;
        
        item.addEventListener('click', async () => {
            try {
                await api.selectCharity(garden._id);
                document.querySelectorAll('.charity-item').forEach(el => {
                    el.classList.remove('selected');
                });
                item.classList.add('selected');
                alert(`You're now supporting ${garden.name}!`);
            } catch (error) {
                console.error('Error selecting charity:', error);
            }
        });
        
        container.appendChild(item);
    });
}
```

### Update index.html

Add a "Find Nearby" button:

```html
<div class="charity-filters">
    <button id="find-nearby-btn" class="btn-primary">
        📍 Find Gardens Near Me
    </button>
    <input type="text" id="charity-city" placeholder="Or search by city">
    <input type="text" id="charity-state" placeholder="State">
    <button id="search-charities-btn" class="btn-secondary">Search</button>
</div>
```

### Update main.js

Wire up the button:

```javascript
// In setupGameHandlers()
document.getElementById('find-nearby-btn').addEventListener('click', () => {
    ui.loadNearbyGardens();
});
```

---

## 🗺️ How Distance Calculation Works

### Haversine Formula

The system uses the **Haversine formula** to calculate the great-circle distance between two points on Earth:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in miles
}
```

**Accuracy:** ±0.5% for most distances

---

## 🔐 Privacy Considerations

### User Location

**Best Practices:**
1. **Always ask permission** before accessing location
2. **Explain why** you need it ("Find gardens near you")
3. **Provide alternatives** (manual search by city/state)
4. **Don't store** user's exact location
5. **Use HTTPS** for all location requests

### Example Permission Request

```javascript
async function requestLocationPermission() {
    // Show explanation first
    const userConsent = confirm(
        'Farm & Give would like to access your location to find ' +
        'community gardens near you. Is that okay?'
    );
    
    if (!userConsent) {
        return null;
    }
    
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}
```

---

## 📊 Use Cases

### 1. First-Time User Onboarding

```javascript
// After character selection
async function suggestNearbyGarden() {
    const position = await requestLocationPermission();
    if (position) {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
            `/api/charity/nearest?lat=${latitude}&lng=${longitude}&limit=1`
        );
        const data = await response.json();
        
        if (data.gardens.length > 0) {
            const nearest = data.gardens[0];
            showNotification(
                `The nearest community garden is ${nearest.name}, ` +
                `just ${nearest.distance} miles away! Support them?`
            );
        }
    }
}
```

### 2. Garden Discovery Map

```javascript
// Show gardens on an interactive map
async function showGardensOnMap(userLat, userLng) {
    const response = await fetch(
        `/api/charity/nearest?lat=${userLat}&lng=${userLng}&radius=100`
    );
    const data = await response.json();
    
    // Use Leaflet, Google Maps, or Mapbox to display
    data.gardens.forEach(garden => {
        addMarkerToMap(
            garden.location.coordinates.lat,
            garden.location.coordinates.lng,
            garden.name,
            garden.distance
        );
    });
}
```

### 3. Auto-Select Nearest Garden

```javascript
// Automatically select the nearest garden for new users
async function autoSelectNearestGarden(userId) {
    const position = await requestLocationPermission();
    if (position) {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
            `/api/charity/nearest?lat=${latitude}&lng=${longitude}&limit=1`
        );
        const data = await response.json();
        
        if (data.gardens.length > 0) {
            await api.selectCharity(data.gardens[0]._id);
            return data.gardens[0];
        }
    }
    return null;
}
```

---

## 🌐 Fallback Options

### If Geolocation Fails

**Option 1: IP-based Location**
```javascript
// Use a service like ipapi.co
async function getLocationFromIP() {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city,
        state: data.region
    };
}
```

**Option 2: Manual Entry**
```javascript
// Let user enter their city/state
async function searchByLocation(city, state) {
    const response = await fetch(
        `/api/charity/organizations?city=${city}&state=${state}`
    );
    return await response.json();
}
```

**Option 3: Zip Code**
```javascript
// Geocode zip code to coordinates
async function geocodeZipCode(zipCode) {
    // Use Google Maps Geocoding API or similar
    // Then call nearest gardens endpoint
}
```

---

## 🧪 Testing

### Test with Different Locations

```bash
# New York City
curl "http://localhost:5000/api/charity/nearest?lat=40.7128&lng=-74.0060&limit=5"

# Los Angeles
curl "http://localhost:5000/api/charity/nearest?lat=34.0522&lng=-118.2437&limit=5"

# Chicago
curl "http://localhost:5000/api/charity/nearest?lat=41.8781&lng=-87.6298&limit=5"

# Seattle
curl "http://localhost:5000/api/charity/nearest?lat=47.6062&lng=-122.3321&limit=5"

# Within 50 mile radius
curl "http://localhost:5000/api/charity/nearest?lat=40.7128&lng=-74.0060&radius=50"
```

### Expected Response

```json
{
  "userLocation": { "lat": 40.7128, "lng": -74.006 },
  "count": 5,
  "gardens": [
    {
      "name": "GreenThumb NYC",
      "distance": 2.3,
      "distanceUnit": "miles",
      // ... full garden object
    }
  ]
}
```

---

## 📈 Performance Optimization

### For Large Datasets

If you have thousands of gardens, consider:

**1. Database Indexing**
```javascript
// Add geospatial index to MongoDB
db.charities.createIndex({ "location.coordinates": "2dsphere" });
```

**2. MongoDB Geospatial Query**
```javascript
// Use MongoDB's built-in geospatial queries
const gardens = await Charity.find({
    "location.coordinates": {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [lng, lat] // Note: [lng, lat] order
            },
            $maxDistance: radiusInMeters
        }
    }
});
```

**3. Caching**
```javascript
// Cache results for common locations
const cache = new Map();
const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
}
```

---

## 🎨 UI Enhancements

### Show Distance Badges

```css
.distance-badge {
    background: #667eea;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: bold;
}

.distance-badge.nearby {
    background: #48bb78; /* Green for < 10 miles */
}

.distance-badge.moderate {
    background: #ed8936; /* Orange for 10-50 miles */
}

.distance-badge.far {
    background: #cbd5e0; /* Gray for > 50 miles */
}
```

### Sort Options

```javascript
// Let users sort by distance or popularity
function sortGardens(gardens, sortBy) {
    if (sortBy === 'distance') {
        return gardens.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'supporters') {
        return gardens.sort((a, b) => b.supporters - a.supporters);
    } else if (sortBy === 'donations') {
        return gardens.sort((a, b) => b.totalReceived - a.totalReceived);
    }
    return gardens;
}
```

---

## 🚀 Next Steps

### 1. Run the Comprehensive Scraper

First, get all ACGA gardens:
```bash
npm run scrape-all-acga
```

### 2. Test the Geolocation API

```bash
# Test with your location
curl "http://localhost:5000/api/charity/nearest?lat=YOUR_LAT&lng=YOUR_LNG&limit=10"
```

### 3. Update the Frontend

Add the geolocation features to your game UI

### 4. Deploy

Once tested, deploy to production with HTTPS for geolocation to work

---

## 📝 Summary

**New Capabilities:**
- ✅ Find nearest gardens by coordinates
- ✅ Search within radius
- ✅ Calculate accurate distances
- ✅ Sort by proximity
- ✅ Privacy-friendly location handling

**API Endpoint:**
```
GET /api/charity/nearest?lat={lat}&lng={lng}&limit={limit}&radius={radius}
```

**Files Created:**
- `server/utils/geolocation.js` - Distance calculation utilities
- `server/routes/charity.js` - Updated with nearest endpoint
- `GEOLOCATION_GUIDE.md` - This guide

**Ready to help players find their local community gardens! 🌱**
