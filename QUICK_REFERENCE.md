# 🚀 Farm & Give - Quick Reference Card

## Essential Commands

```bash
# Install everything
npm install

# Seed database with ACGA gardens
npm run scrape-gardens

# Start the game
npm start

# Development mode (auto-reload)
npm run dev
```

## Access Points

- **Game**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## File Structure

```
windsurf-project/
├── server/               # Backend
│   ├── index.js         # Server entry
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── scripts/         # Utility scripts
│       ├── seed.js      # Original seeder
│       └── scrapeGardens.js  # ACGA scraper ⭐
│
├── client/              # Frontend
│   ├── index.html       # Main page
│   ├── css/            # Styles
│   └── js/             # Game logic
│
└── docs/               # Documentation
    ├── README.md
    ├── QUICKSTART.md
    ├── SETUP.md
    ├── ACGA_INTEGRATION.md  # ACGA guide ⭐
    └── ACGA_SUMMARY.md      # ACGA summary ⭐
```

## Game Features

### Characters (5)
- ☀️ Sunny - Crops grow 10% faster
- 🌙 Luna - Night crops yield double
- 🌍 Terra - Soil quality +15%
- 💧 River - Water efficiency +20%
- 🧙 Sage - Experience +25%

### Crops (4)
- 🥕 Carrot - 30s/stage, 15 coins
- 🍅 Tomato - 40s/stage, 20 coins
- 🌾 Wheat - 25s/stage, 12 coins
- 🌽 Corn - 35s/stage, 18 coins

### Tools
- 👋 Move - Walk around
- 🔨 Till - Prepare soil
- 🌱 Plant - Plant seeds
- 💧 Water - Water crops
- ✂️ Harvest - Collect crops

## ACGA Integration ⭐

### What's New
- 15 real ACGA-affiliated gardens
- Search by city/state
- Verified organizations
- 10% auto-donation

### Gardens Included
- Seattle P-Patch (WA)
- Denver Urban Gardens (CO)
- GreenThumb NYC (NY)
- Philadelphia Horticultural Society (PA)
- Chicago Urban Agriculture (IL)
- + 10 more major cities

### Commands
```bash
# Load ACGA gardens
npm run scrape-gardens

# Advanced scraping (experimental)
npm run scrape-gardens-advanced
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user

### Game
- `GET /api/game/characters` - Get characters
- `POST /api/game/select-character` - Select character
- `POST /api/game/save` - Save game
- `GET /api/game/load` - Load game

### Charity ⭐
- `GET /api/charity/organizations` - Get gardens
- `POST /api/charity/select` - Select garden
- `GET /api/charity/stats/impact` - Global impact
- `GET /api/charity/my-impact` - Personal impact

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/farm-and-give
JWT_SECRET=your_secret_key
CHARITY_PERCENTAGE=10
```

## Troubleshooting

### Can't connect to MongoDB
```bash
# Check if MongoDB is running
mongosh

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Port already in use
```bash
# Change PORT in .env
PORT=3000
```

### Game won't load
```bash
# Check server is running
npm start

# Check browser console (F12)
# Clear browser cache
```

### No gardens showing
```bash
# Run the scraper
npm run scrape-gardens

# Check database
mongosh
use farm-and-give
db.charities.find()
```

## Quick Links

- **ACGA Website**: https://www.communitygarden.org/garden
- **ACGA Email**: info@communitygarden.org
- **Full Docs**: See README.md
- **Setup Guide**: See SETUP.md
- **ACGA Guide**: See ACGA_INTEGRATION.md

## Development Workflow

### 1. First Time Setup
```bash
npm install
cp .env.example .env
# Edit .env
npm run scrape-gardens
npm start
```

### 2. Daily Development
```bash
npm run dev
# Make changes
# Browser auto-reloads
```

### 3. Adding Gardens
```bash
# Edit server/scripts/scrapeGardens.js
# Add new garden object
npm run scrape-gardens
```

### 4. Testing
```bash
# Start server
npm start

# Open browser
http://localhost:5000

# Test features:
# - Register/Login
# - Select character
# - Farm crops
# - Select charity
# - View impact
```

## Key Files to Edit

### Add Crops
`client/js/farming.js` - cropTypes object

### Add Characters
`server/routes/game.js` - characters array

### Add Gardens
`server/scripts/scrapeGardens.js` - getManualGardenData()

### Change Charity %
`.env` - CHARITY_PERCENTAGE=10

## Database Commands

```bash
# Connect to MongoDB
mongosh

# Switch to database
use farm-and-give

# View collections
show collections

# View users
db.users.find().pretty()

# View gardens
db.charities.find().pretty()

# Count gardens
db.charities.countDocuments()

# Find by city
db.charities.find({"location.city": "Seattle"})

# Drop database (reset)
db.dropDatabase()
```

## NPM Scripts

```bash
npm start                    # Start server
npm run dev                  # Dev mode (auto-reload)
npm run seed                 # Original seeder
npm run scrape-gardens       # Load ACGA gardens ⭐
npm run scrape-gardens-advanced  # Advanced scraper ⭐
```

## Game Controls

### Keyboard
- **WASD** or **Arrow Keys** - Move
- **Mouse Click** - Use tool on tile

### Mobile
- **Touch** - Move and interact

## Support Resources

### Documentation
- `README.md` - Overview
- `QUICKSTART.md` - 5-min setup
- `SETUP.md` - Detailed setup
- `API_DOCUMENTATION.md` - API reference
- `GAME_DESIGN.md` - Game design
- `FEATURES.md` - Feature roadmap
- `ACGA_INTEGRATION.md` - ACGA guide ⭐
- `ACGA_SUMMARY.md` - ACGA summary ⭐

### External
- MongoDB Docs: https://docs.mongodb.com
- Node.js Docs: https://nodejs.org/docs
- Express Docs: https://expressjs.com
- ACGA Website: https://www.communitygarden.org

## Version Info

- **Version**: 1.0.0
- **Node**: v16+
- **MongoDB**: v5+
- **License**: MIT

---

**🌱 Happy Farming & Giving!**
