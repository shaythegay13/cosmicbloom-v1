# ACGA Community Garden Integration Guide

## Overview

This project now integrates with the **American Community Gardening Association (ACGA)** database to support real community gardens across the United States and worldwide.

**ACGA Website**: https://www.communitygarden.org/garden

---

## 🌍 About ACGA

The American Community Gardening Association is the leading organization supporting community gardening in North America. Their database includes:

- **Thousands of community gardens** across the US and internationally
- **Verified organizations** and garden networks
- **Contact information** for local garden coordinators
- **Geographic data** for finding gardens near you

---

## 📊 Data Integration Methods

### Method 1: Manual Curated Data (Recommended)

We've curated a list of **15 major ACGA-affiliated community garden organizations** across the US:

```bash
npm run scrape-gardens
```

**Included Gardens:**
- Seattle P-Patch Community Gardens (WA)
- Denver Urban Gardens (CO)
- GreenThumb NYC (NY)
- Philadelphia Horticultural Society (PA)
- Chicago Urban Agriculture (IL)
- Austin Community Gardens (TX)
- Portland Community Gardens (OR)
- Boston Urban Gardeners (MA)
- San Francisco Community Gardens (CA)
- Atlanta Community Food Bank Gardens (GA)
- Los Angeles Community Garden Council (CA)
- Miami-Dade Community Gardens (FL)
- Twin Cities Community Gardens (MN)
- Phoenix Community Gardens (AZ)
- Detroit Urban Farming Initiative (MI)

**Advantages:**
- ✅ Verified and accurate data
- ✅ Major garden networks included
- ✅ Works immediately
- ✅ No external dependencies

### Method 2: Advanced Web Scraping (Experimental)

For extracting data directly from the ACGA map:

```bash
npm run scrape-gardens-advanced
```

**Note:** The ACGA website uses a JavaScript-rendered map (likely Google Maps), which makes automated scraping challenging. This method uses Puppeteer to:
- Launch a headless browser
- Navigate to the map page
- Attempt to extract garden data
- Take screenshots for debugging

**Limitations:**
- May not extract all data due to map implementation
- Requires Puppeteer (larger dependency)
- Slower than manual method

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `axios` - HTTP client for web requests
- `cheerio` - HTML parsing
- `puppeteer` - Headless browser automation

### 2. Run the Scraper

```bash
# Use the curated ACGA data (recommended)
npm run scrape-gardens

# OR use advanced scraping (experimental)
npm run scrape-gardens-advanced
```

### 3. Verify Data

The script will:
1. Connect to your MongoDB database
2. Clear existing charity data
3. Insert ACGA-affiliated gardens
4. Display summary of gardens by location

**Output:**
```
🌱 ACGA Community Garden Scraper

Using curated ACGA-affiliated garden data...

Found 15 community gardens
✅ Connected to MongoDB
Cleared existing charities
✅ Saved 15 community gardens to database

✅ Successfully updated community garden database!

📍 Gardens by location:
   Seattle, WA: 1 garden(s)
   Denver, CO: 1 garden(s)
   New York, NY: 1 garden(s)
   ...
```

---

## 📝 Adding More Gardens

### From ACGA Website

1. **Visit the ACGA Map**
   - Go to https://www.communitygarden.org/garden
   - Browse the interactive map
   - Click on garden markers to view details

2. **Collect Garden Information**
   - Name
   - Address and location
   - Contact information
   - Type (community garden, urban farm, etc.)

3. **Add to Scraper**
   - Open `server/scripts/scrapeGardens.js`
   - Add new garden object to `getManualGardenData()` array:

```javascript
{
    name: "Garden Name",
    type: "community_garden", // or "urban_farm" or "agricultural_initiative"
    description: "Description of the garden",
    location: {
        address: "123 Main St",
        city: "City Name",
        state: "ST",
        zipCode: "12345",
        country: "USA",
        coordinates: { 
            lat: 40.7128,  // Get from Google Maps
            lng: -74.0060 
        }
    },
    contact: {
        email: "contact@garden.org",
        phone: "(555) 123-4567",
        website: "https://garden.org"
    },
    verified: true,
    acgaAffiliated: true
}
```

4. **Run Scraper Again**
   ```bash
   npm run scrape-gardens
   ```

### Bulk Import

For adding many gardens at once:

1. **Download ACGA Template**
   - Visit https://www.communitygarden.org/garden
   - Download the [ACGA Garden Submission Template](https://www.communitygarden.org/_files/ugd/f96093_afdb7087e0104742ac506b7b53b51624.xlsx)

2. **Convert to JSON**
   - Fill in the Excel template
   - Convert to JSON format
   - Add to scraper script

3. **Contact ACGA**
   - Email: info@communitygarden.org
   - Request API access or bulk data export

---

## 🗄️ Database Schema

Gardens are stored with the following fields:

```javascript
{
  name: String,                    // Garden name
  type: String,                    // community_garden | urban_farm | agricultural_initiative
  description: String,             // About the garden
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      lat: Number,                 // Latitude
      lng: Number                  // Longitude
    }
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  verified: Boolean,               // Verified by us
  acgaAffiliated: Boolean,         // ACGA member
  acgaId: String,                  // ACGA database ID (if available)
  totalReceived: Number,           // Total donations received
  supporters: Number,              // Number of supporters
  images: [String],                // Garden photos
  createdAt: Date
}
```

---

## 🎮 In-Game Integration

### How It Works

1. **Player Selects Garden**
   - Players can search for gardens by city/state
   - Filter by type (community garden, urban farm, etc.)
   - View garden details and impact

2. **Automatic Donations**
   - 10% of all in-game purchases go to selected garden
   - Tracked in real-time
   - Displayed in charity dashboard

3. **Impact Tracking**
   - Players see their total contribution
   - View garden's total received
   - See number of supporters

### API Endpoints

**Get All Gardens:**
```
GET /api/charity/organizations?city=Seattle&state=WA
```

**Select Garden:**
```
POST /api/charity/select
Body: { "charityId": "garden_id_here" }
```

**View Impact:**
```
GET /api/charity/my-impact
```

---

## 🔍 Finding Garden Coordinates

### Method 1: Google Maps

1. Go to https://maps.google.com
2. Search for the garden address
3. Right-click on the location
4. Click on the coordinates to copy
5. Format: `lat, lng` (e.g., `47.6062, -122.3321`)

### Method 2: Geocoding API

Use a geocoding service to convert addresses to coordinates:

```javascript
// Example using a geocoding service
const address = "123 Main St, Seattle, WA 98101";
// Returns: { lat: 47.6062, lng: -122.3321 }
```

---

## 📊 Data Quality

### Verification Checklist

Before adding a garden:
- ✅ Verify it's a real, active community garden
- ✅ Confirm contact information is current
- ✅ Check if it accepts donations
- ✅ Verify ACGA affiliation (if applicable)
- ✅ Ensure coordinates are accurate

### Data Sources

**Trusted Sources:**
- ACGA official database
- City parks and recreation departments
- Local community garden networks
- Cooperative Extension offices

---

## 🤝 Partnership Opportunities

### Working with ACGA

**Benefits:**
- Access to verified garden database
- Official ACGA endorsement
- Marketing support
- Community credibility

**Contact:**
- Email: info@communitygarden.org
- Website: https://www.communitygarden.org
- Address: 1441 Woodmont Ln NW Suite 1400, Atlanta, GA 30318

### Proposal Points

When reaching out to ACGA:
1. **Mission Alignment** - Supporting community gardens through gaming
2. **Transparency** - 10% of all revenue to gardens
3. **Technology** - Modern platform for garden discovery
4. **Impact** - Potential to reach thousands of players
5. **Data** - Help gardens track their supporters

---

## 🔄 Updating Garden Data

### Regular Updates

**Recommended Schedule:**
- **Monthly**: Check for new gardens in major cities
- **Quarterly**: Verify contact information
- **Annually**: Full database audit

**Update Process:**
1. Check ACGA website for new gardens
2. Verify existing garden information
3. Update scraper script
4. Run scraper to update database
5. Test in-game charity selection

---

## 📈 Analytics & Reporting

### Track Garden Impact

```javascript
// Get total donations per garden
db.charities.aggregate([
  {
    $project: {
      name: 1,
      totalReceived: 1,
      supporters: 1
    }
  },
  { $sort: { totalReceived: -1 } }
])
```

### Generate Reports

Create quarterly reports showing:
- Total donations to each garden
- Number of supporters per garden
- Geographic distribution of support
- Growth trends

---

## 🚨 Important Notes

### Legal Considerations

- ✅ Verify gardens can accept donations
- ✅ Ensure proper tax documentation
- ✅ Maintain transparent records
- ✅ Comply with local regulations

### Privacy

- ✅ Don't share personal donor information
- ✅ Aggregate donation data only
- ✅ Respect garden privacy preferences

### Accuracy

- ✅ Verify all garden information
- ✅ Update regularly
- ✅ Remove inactive gardens
- ✅ Correct errors promptly

---

## 🎯 Future Enhancements

### Planned Features

1. **Real-time ACGA API Integration**
   - Direct connection to ACGA database
   - Automatic updates
   - Live garden status

2. **Garden Profiles**
   - Photos and videos
   - Success stories
   - Volunteer opportunities

3. **Impact Visualization**
   - Interactive maps
   - Donation heatmaps
   - Growth charts

4. **Garden Communication**
   - Direct messaging
   - Update notifications
   - Event announcements

---

## 📞 Support

### For Technical Issues
- Check `SETUP.md` for configuration help
- Review scraper logs for errors
- Verify MongoDB connection

### For Garden Data
- Visit ACGA website: https://www.communitygarden.org
- Email ACGA: info@communitygarden.org
- Check local garden networks

---

## 🙏 Acknowledgments

**Thank you to:**
- American Community Gardening Association (ACGA)
- All community garden coordinators
- Local garden networks
- Players supporting community gardens

---

**Together, we're growing communities! 🌱**
