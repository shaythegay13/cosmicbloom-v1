# Farm & Give - Setup Guide

## Quick Start Guide

### 1. Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Choose one:
  - Local: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
- **npm** (comes with Node.js)

### 2. Installation Steps

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Use notepad, VS Code, or any text editor
notepad .env
```

**Required Configuration:**
```env
# Database - Choose one:
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/farm-and-give

# Option B: MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm-and-give

# JWT Secret - Generate a random string
JWT_SECRET=your_super_secret_key_change_this_in_production

# Stripe (Optional for now - can add later)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

#### Step 3: Start MongoDB (if using local)
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

#### Step 4: Seed the Database
```bash
node server/scripts/seed.js
```

This will populate your database with sample community gardens and urban farms.

#### Step 5: Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### 3. Access the Game

Open your web browser and navigate to:
```
http://localhost:5000
```

### 4. Create Your First Account

1. Click "Register" on the login screen
2. Enter a username, email, and password
3. Select your favorite farmer character
4. Start farming!

## Game Controls

### Movement
- **Arrow Keys** or **WASD** - Move your character
- **Mouse Click** - Interact with tiles using selected tool

### Tools (Bottom Toolbar)
- **👋 Move** - Walk around
- **🔨 Till** - Prepare soil for planting
- **🌱 Plant** - Plant seeds in tilled soil
- **💧 Water** - Water your crops
- **✂️ Harvest** - Collect fully grown crops

### Farming Cycle
1. **Till** the soil (brown color)
2. **Plant** seeds (you start with some)
3. **Water** the crop (red indicator = needs water)
4. **Wait** for crop to grow (automatic)
5. **Harvest** when fully grown
6. **Sell** crops for coins (automatic on harvest)

### Top Menu
- **🛒 Shop** - Buy seeds, tools, and decorations
- **💚 Charity** - Select your local community garden
- **☰ Menu** - Save game, settings, logout

## MongoDB Setup Options

### Option A: Local MongoDB

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select your OS and download
   - Run the installer

2. **Start MongoDB**
   ```bash
   # Windows (as service)
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Verify it's running**
   ```bash
   mongosh
   # Should connect to MongoDB shell
   ```

### Option B: MongoDB Atlas (Cloud - Recommended for beginners)

1. **Create Free Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create a Cluster**
   - Choose "Shared" (Free tier)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access"
   - Add a new database user
   - Remember the username and password

4. **Setup Network Access**
   - Go to "Network Access"
   - Add IP Address
   - Click "Allow Access from Anywhere" (for development)

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Use this in your `.env` file

## Stripe Payment Setup (Optional)

To enable real payments:

1. **Create Stripe Account**
   - Visit: https://stripe.com
   - Sign up for free

2. **Get API Keys**
   - Go to Developers > API Keys
   - Copy "Publishable key" and "Secret key"
   - Use test keys (start with `pk_test_` and `sk_test_`)

3. **Add to .env**
   ```env
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running
- Check your connection string in `.env`
- For Atlas, verify network access settings

### "Port 5000 already in use"
- Change the PORT in `.env`:
  ```env
  PORT=3000
  ```

### "Module not found"
- Run `npm install` again
- Delete `node_modules` and run `npm install`

### Game won't load
- Check browser console (F12) for errors
- Make sure server is running
- Try clearing browser cache

### Can't save game
- Check if you're logged in
- Verify MongoDB connection
- Check server console for errors

## Development Tips

### Viewing Database
```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use farm-and-give

# View users
db.users.find()

# View charities
db.charities.find()

# View transactions
db.transactions.find()
```

### Reset Database
```bash
# Drop database
mongosh
use farm-and-give
db.dropDatabase()

# Re-seed
node server/scripts/seed.js
```

### Testing Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and any 3-digit CVC

## Next Steps

1. **Customize Characters** - Edit `server/routes/game.js`
2. **Add More Crops** - Edit `client/js/farming.js`
3. **Create New Areas** - Expand `client/js/world.js`
4. **Add Sound Effects** - Create `client/assets/audio/` folder
5. **Deploy to Production** - See `DEPLOYMENT.md` (coming soon)

## Support

For issues or questions:
- Check the README.md
- Review game code in `client/js/`
- Check server logs in terminal
- MongoDB logs for database issues

## License

MIT License - Free to use and modify!
