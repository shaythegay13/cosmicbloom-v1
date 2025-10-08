# 🗺️ How to Scrape ALL ACGA Community Gardens

## Quick Start

### Option 1: Run the Comprehensive Scraper

```bash
# In Command Prompt (not PowerShell)
npm run scrape-all-acga
```

**Or directly:**
```bash
node server/scripts/scrapeAllACGAGardens.js
```

This will:
1. Launch a headless browser
2. Navigate to the ACGA map
3. Intercept network requests
4. Extract all garden data
5. Save to MongoDB
6. Create backup JSON file

---

## If PowerShell Blocks npm

### Fix PowerShell Execution Policy

**Option A: Run in Command Prompt instead**
1. Open Command Prompt (cmd.exe)
2. Navigate to project folder
3. Run: `npm run scrape-all-acga`

**Option B: Fix PowerShell (Admin required)**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run:
```powershell
npm run scrape-all-acga
```

---

## Understanding the ACGA Map

The ACGA website (https://www.communitygarden.org/garden) uses an embedded map that loads garden data dynamically. The scraper uses multiple strategies:

### Strategy 1: Network Interception
- Captures API calls made by the map
- Extracts JSON responses with garden data
- Most reliable if map uses REST API

### Strategy 2: JavaScript Extraction
- Looks for garden data in window object
- Parses script tags for JSON data
- Works if data is embedded in page

### Strategy 3: DOM Parsing
- Extracts data from map markers
- Reads data attributes from HTML elements
- Works for simple marker-based maps

### Strategy 4: iframe Analysis
- Checks for embedded map iframes
- Attempts to access iframe content
- Works if map is in accessible iframe

---

## Expected Output

### Success Case
```
═══════════════════════════════════════════════════════════
🌱 ACGA COMPREHENSIVE COMMUNITY GARDEN SCRAPER
═══════════════════════════════════════════════════════════

🚀 Launching browser with network monitoring...

🗺️  Navigating to ACGA garden map...

✅ Page loaded

⏳ Waiting for map to load...

✅ Map container found

📡 API Request: https://api.example.com/gardens
📥 Captured JSON response from: https://api.example.com/gardens

🔍 Extracting garden data from page...

Found 3 frame(s) on page

✅ Found 1,247 gardens in network response

🔄 Processing 1,247 raw garden entries...

✅ Processed 1,247 unique gardens

💾 Saving gardens to acga-gardens.json...

✅ Saved 1,247 gardens to JSON file

💾 Connecting to MongoDB...

✅ Connected to MongoDB

🗑️  Cleared 15 existing charities

✅ Saved 1,247 community gardens to database

═══════════════════════════════════════════════════════════
📊 SCRAPING RESULTS
═══════════════════════════════════════════════════════════

Total gardens found: 1,247

Gardens by state:
  CA: 234 garden(s)
  NY: 187 garden(s)
  TX: 156 garden(s)
  ...

✅ SUCCESS! All gardens saved to database

💾 Backup saved to: acga-gardens.json
```

### If No Data Found
```
⚠️  WARNING: No gardens were extracted!

The ACGA map likely uses one of these methods:
  1. Third-party mapping service (Google Maps, Mapbox, etc.)
  2. API that requires authentication
  3. Data loaded via complex JavaScript

📝 Next steps:
  1. Check acga-page.html for map implementation details
  2. Check acga-map-full.png to see what loaded
  3. Look for API endpoints in browser DevTools
  4. Contact ACGA for API access: info@communitygarden.org
```

---

## Manual Investigation

If the automated scraper doesn't work, you can manually investigate:

### Step 1: Open Browser DevTools

1. Go to https://www.communitygarden.org/garden
2. Press F12 to open DevTools
3. Go to **Network** tab
4. Reload the page
5. Look for API calls that load garden data

### Step 2: Find the API Endpoint

Look for requests that:
- Return JSON data
- Contain garden/location information
- Have URLs like `/api/gardens` or `/locations`

### Step 3: Analyze the Response

Click on the API request and check:
- **Response** tab - See the JSON structure
- **Headers** tab - Check if authentication is needed
- **Preview** tab - See formatted data

### Step 4: Extract the Data

If you find the API endpoint:

```javascript
// Example: If the API is at https://example.com/api/gardens
const response = await fetch('https://example.com/api/gardens');
const gardens = await response.json();
console.log(gardens);
```

### Step 5: Update the Scraper

Add the API endpoint to the scraper:

```javascript
// In scrapeAllACGAGardens.js
async extractFromAPI() {
    const apiUrl = 'https://api.example.com/gardens'; // Replace with actual URL
    const response = await this.page.evaluate(async (url) => {
        const res = await fetch(url);
        return await res.json();
    }, apiUrl);
    
    return response;
}
```

---

## Alternative: Manual Data Collection

If automated scraping doesn't work, you can manually collect gardens:

### Method 1: Use ACGA's Bulk Template

1. Visit https://www.communitygarden.org/garden
2. Download the [ACGA Garden Submission Template](https://www.communitygarden.org/_files/ugd/f96093_afdb7087e0104742ac506b7b53b51624.xlsx)
3. Contact ACGA: info@communitygarden.org
4. Request bulk garden data export

### Method 2: Regional Scraping

Scrape gardens region by region:

1. Zoom into a specific city on the map
2. Click on each garden marker
3. Copy the information
4. Add to `scrapeGardens.js`

### Method 3: Partner with ACGA

**Best long-term solution:**

1. Contact ACGA: info@communitygarden.org
2. Explain your project and mission
3. Request API access or data export
4. Establish official partnership

**Benefits:**
- Access to complete, verified data
- Regular updates
- Official endorsement
- Marketing support

---

## Troubleshooting

### "No gardens extracted"

**Possible causes:**
1. Map uses Google Maps API (requires API key)
2. Data loaded via authenticated API
3. Map uses Mapbox or other third-party service
4. JavaScript obfuscation/protection

**Solutions:**
1. Check `acga-page.html` for map implementation
2. Look at `acga-map-full.png` to see what rendered
3. Use browser DevTools to find API endpoints
4. Contact ACGA for official data access

### "Browser won't launch"

**Fix:**
```bash
# Install Puppeteer dependencies
npm install puppeteer

# Or use system Chrome
npm install puppeteer-core
```

### "Connection timeout"

**Fix:**
```javascript
// Increase timeout in scraper
await this.page.goto(this.url, {
    waitUntil: 'networkidle2',
    timeout: 120000  // 2 minutes
});
```

### "Cannot access iframe"

**Cause:** Cross-origin restrictions

**Fix:** The scraper already handles this, but if needed:
```javascript
// Disable web security (use carefully)
puppeteer.launch({
    args: ['--disable-web-security']
});
```

---

## Output Files

After running the scraper, you'll get:

### 1. `acga-gardens.json`
- Backup of all scraped gardens
- JSON format for easy inspection
- Can be manually edited if needed

### 2. `acga-map-full.png`
- Screenshot of the ACGA map
- Shows what the browser saw
- Useful for debugging

### 3. `acga-page.html`
- Full HTML of the page
- Inspect map implementation
- Find embedded scripts/data

### 4. MongoDB Database
- All gardens saved to `charities` collection
- Ready to use in your game
- Searchable by location

---

## Using the Scraped Data

Once gardens are in the database, players can:

### 1. Search by Location
```javascript
// Find gardens near user
GET /api/charity/organizations?city=Seattle&state=WA
```

### 2. Geolocation Matching
```javascript
// Find closest garden to user's coordinates
const userLat = 47.6062;
const userLng = -122.3321;

// Calculate distance and find nearest
```

### 3. Filter by Type
```javascript
// Show only urban farms
GET /api/charity/organizations?type=urban_farm
```

---

## Next Steps After Scraping

### 1. Add Geolocation to Game

Update the charity selection to:
- Get user's location (with permission)
- Calculate distance to each garden
- Sort by proximity
- Show "nearest gardens" first

### 2. Enhance Garden Profiles

Add more information:
- Photos of gardens
- Success stories
- Volunteer opportunities
- Events calendar

### 3. Real-time Updates

Set up automated scraping:
- Run scraper monthly
- Update garden information
- Add new gardens
- Remove inactive ones

---

## Contact ACGA

For best results, consider reaching out to ACGA:

**Email:** info@communitygarden.org  
**Website:** https://www.communitygarden.org  
**Address:** 1441 Woodmont Ln NW Suite 1400, Atlanta, GA 30318

**What to say:**
```
Subject: Partnership Opportunity - Farm & Give Game

Hi ACGA Team,

I'm developing a farming simulation game called "Farm & Give" where 
10% of all in-game purchases go directly to community gardens.

We'd love to integrate your complete garden database to help players 
find and support gardens near them. Would you be open to:

1. Providing API access to your garden database
2. Partnering officially with our game
3. Receiving regular donations from our players

Our game could help bring visibility and funding to community gardens 
across the country. I'd love to discuss this further.

Best regards,
[Your Name]
```

---

## Summary

**To scrape all ACGA gardens:**

```bash
# Run the comprehensive scraper
npm run scrape-all-acga

# Check the output
# - acga-gardens.json (backup)
# - acga-map-full.png (screenshot)
# - acga-page.html (page source)
# - MongoDB database (live data)
```

**If it doesn't work:**
1. Investigate with browser DevTools
2. Find the API endpoint manually
3. Update the scraper
4. Or contact ACGA for official access

**Best long-term solution:**
Partner with ACGA for official data access and endorsement!

🌱 Happy scraping!
