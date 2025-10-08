# 🗺️ Manual Garden Data Extraction Guide

## The Situation

The ACGA map uses a **LocatedMap widget** embedded in Wix that doesn't expose its data through public APIs. After extensive testing, automated scraping cannot access the garden data.

## ✅ **BEST SOLUTION: Contact ACGA Directly**

### Why This Is The Best Approach

1. **Legal** - You'll have permission to use the data
2. **Complete** - Access to ALL gardens, not just what's on the map
3. **Accurate** - Verified, up-to-date information
4. **Partnership** - Official endorsement for your game
5. **Updates** - Regular data updates as new gardens join

### How To Contact ACGA

**Email Template:**

```
Subject: Partnership Request - Farm & Give Game Supporting Community Gardens

Dear ACGA Team,

I'm developing a farming simulation game called "Farm & Give" where 10% of all 
in-game purchases go directly to community gardens chosen by players.

I'd like to integrate your community garden database to help players discover 
and support gardens near them. This would:

- Bring visibility to ACGA member gardens
- Generate donations for community gardens nationwide
- Help players connect with local gardening initiatives
- Provide transparent impact tracking

Could we discuss:
1. Access to your garden database (API or data export)
2. Official partnership/endorsement
3. How to best support ACGA's mission through the game

The game is built and ready - we just need the garden data to launch!

Thank you for considering this partnership.

Best regards,
[Your Name]
[Your Contact Info]
```

**Contact Information:**
- **Email**: info@communitygarden.org
- **Website**: https://www.communitygarden.org
- **Phone**: Check their website
- **Address**: 1441 Woodmont Ln NW Suite 1400, Atlanta, GA 30318

---

## 🛠️ Alternative: Browser Console Extraction

If you need data immediately while waiting for ACGA's response, you can manually extract it:

### Step 1: Open Browser DevTools

1. Go to https://www.communitygarden.org/garden
2. Press **F12** to open DevTools
3. Go to **Console** tab

### Step 2: Wait for Map to Load

Wait until you see garden markers on the map (about 10 seconds)

### Step 3: Run Extraction Script

Paste this into the console and press Enter:

```javascript
// Extract garden data from LocatedMap widget
(function() {
    console.log('🔍 Searching for garden data...');
    
    const gardens = [];
    
    // Method 1: Check iframe
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
        try {
            const iframeWindow = iframe.contentWindow;
            
            // Try common variable names
            if (iframeWindow.locations) {
                gardens.push(...iframeWindow.locations);
                console.log(`✅ Found ${iframeWindow.locations.length} in iframe ${index}`);
            }
            if (iframeWindow.markers) {
                gardens.push(...iframeWindow.markers);
                console.log(`✅ Found ${iframeWindow.markers.length} markers in iframe ${index}`);
            }
            if (iframeWindow.mapData) {
                gardens.push(...iframeWindow.mapData);
            }
        } catch (e) {
            console.log(`⚠️ Cannot access iframe ${index} (cross-origin)`);
        }
    });
    
    // Method 2: Check window object
    if (window.locations) gardens.push(...window.locations);
    if (window.markers) gardens.push(...window.markers);
    if (window.mapData) gardens.push(...window.mapData);
    
    // Method 3: Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (parsed[0].lat || parsed[0].latitude) {
                    gardens.push(...parsed);
                    console.log(`✅ Found ${parsed.length} in localStorage.${key}`);
                }
            }
        } catch (e) {}
    }
    
    if (gardens.length > 0) {
        console.log(`\n✅ SUCCESS! Found ${gardens.length} gardens`);
        console.log('📋 Copying to clipboard...');
        
        const json = JSON.stringify(gardens, null, 2);
        navigator.clipboard.writeText(json);
        
        console.log('✅ Data copied! Paste into a text file.');
        console.log('\nFirst garden:', gardens[0]);
        
        // Also download as file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'acga-gardens.json';
        a.click();
        
        console.log('✅ Also downloaded as acga-gardens.json');
    } else {
        console.log('❌ No garden data found');
        console.log('💡 The data might be loaded differently');
        console.log('Try clicking on the map to trigger data loading');
    }
    
    return gardens;
})();
```

### Step 4: Save The Data

The script will:
1. Copy data to your clipboard
2. Download a JSON file
3. Display the data in console

### Step 5: Import to Database

Once you have the JSON file:

```bash
# Create import script
node server/scripts/importGardens.js acga-gardens.json
```

---

## 🔍 Alternative: Network Tab Inspection

### Step 1: Open Network Tab

1. Go to https://www.communitygarden.org/garden
2. Press **F12** → **Network** tab
3. Reload the page

### Step 2: Filter Requests

- Look for requests to `locatedmap.com`
- Filter by **XHR** or **Fetch**
- Look for JSON responses

### Step 3: Find Garden Data

Click on each request and check:
- **Preview** tab - See formatted data
- **Response** tab - See raw JSON

Look for arrays with objects containing:
- `lat` / `latitude`
- `lng` / `longitude`
- `name` / `title`
- `address` / `location`

### Step 4: Copy Response

Right-click on the response → **Copy** → **Copy response**

---

## 📊 Alternative: Use Curated Data + Expand

### Start With Our 15 Gardens

```bash
npm run scrape-gardens
```

This loads 15 major ACGA-affiliated organizations.

### Gradually Expand

Add more gardens manually by:

1. **Visiting Regional Networks**
   - Seattle P-Patch: https://www.seattle.gov/neighborhoods/programs-and-services/p-patch-community-gardening
   - Denver Urban Gardens: https://www.dug.org
   - GreenThumb NYC: https://greenthumb.nycgovparks.org
   
2. **Requesting Member Lists**
   - Contact each network for their member gardens
   - Most will provide lists for partnership purposes

3. **Adding to Database**
   - Edit `server/scripts/scrapeGardens.js`
   - Add new garden objects
   - Run the scraper

---

## 🤝 Partnership Benefits

When you contact ACGA, emphasize these benefits:

### For ACGA
- ✅ Increased visibility for member gardens
- ✅ New funding source (10% of game revenue)
- ✅ Younger audience engagement
- ✅ Modern platform for garden discovery
- ✅ Transparent impact tracking

### For Gardens
- ✅ Direct donations from players
- ✅ New supporters and volunteers
- ✅ Geographic discovery (players find nearby gardens)
- ✅ No cost to participate

### For Your Game
- ✅ Official ACGA endorsement
- ✅ Complete, verified data
- ✅ Regular updates
- ✅ Marketing support
- ✅ Credibility and trust

---

## 📝 Next Steps

### Immediate (While Waiting for ACGA)

1. **Use curated list**: `npm run scrape-gardens`
2. **Start with 15 major gardens**
3. **Build and test the game**
4. **Add more gardens manually**

### Short-term (1-2 weeks)

1. **Email ACGA** with partnership request
2. **Follow up** after 3-5 business days
3. **Prepare demo** of your game to show them
4. **Discuss partnership terms**

### Long-term (1-3 months)

1. **Get API access** or data export from ACGA
2. **Official partnership** announcement
3. **Regular data updates**
4. **Expand to international gardens**

---

## 💡 Why Manual Contact Is Better Than Scraping

### Legal
- ✅ You have permission to use the data
- ✅ No terms of service violations
- ✅ No copyright issues

### Quality
- ✅ Verified, accurate information
- ✅ Complete dataset (not just what's visible)
- ✅ Contact information included
- ✅ Regular updates

### Relationship
- ✅ Official partnership
- ✅ Marketing support
- ✅ Community credibility
- ✅ Future collaboration opportunities

### Technical
- ✅ No scraping maintenance
- ✅ No breaking when site changes
- ✅ API access (if provided)
- ✅ Structured, clean data

---

## 🎯 Summary

**Best Approach:**
1. Contact ACGA for official partnership
2. Request database access or export
3. Use curated list while waiting
4. Expand manually with regional networks

**Your game is ready - you just need the data!**

The partnership approach will give you:
- ✅ Complete data
- ✅ Legal permission
- ✅ Official endorsement
- ✅ Long-term sustainability

**Contact ACGA today!** 📧 info@communitygarden.org
