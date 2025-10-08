# 🚀 Quick Start - Get Playing in 5 Minutes!

## Step 1: Install Node.js
If you don't have Node.js installed:
- Go to https://nodejs.org/
- Download and install the LTS version
- Verify: Open terminal and type `node --version`

## Step 2: Install MongoDB

### Option A: MongoDB Atlas (Cloud - Easiest!)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a free cluster (takes 3-5 minutes)
4. Create a database user
5. Allow access from anywhere (for development)
6. Get your connection string

### Option B: Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service

## Step 3: Setup the Game

Open terminal in the project folder and run:

```bash
# Install dependencies
npm install

# Create .env file
# Copy .env.example to .env and edit it
```

**Edit your .env file:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=any_random_string_here
CHARITY_PERCENTAGE=10
CLIENT_URL=http://localhost:5000
```

## Step 4: Seed the Database

```bash
node server/scripts/seed.js
```

This adds sample community gardens to your database.

## Step 5: Start the Server

```bash
npm start
```

## Step 6: Play!

Open your browser and go to:
```
http://localhost:5000
```

## 🎮 First Time Playing?

1. **Register** - Create your account
2. **Choose Character** - Pick your favorite farmer
3. **Start Farming!**
   - Use arrow keys or WASD to move
   - Click tiles with tools selected
   - Till → Plant → Water → Harvest

## 🔧 Troubleshooting

**"Cannot connect to MongoDB"**
- Check your MONGODB_URI in .env
- Make sure MongoDB is running (if local)

**"Port already in use"**
- Change PORT in .env to 3000 or another number

**Game won't load**
- Make sure server is running
- Check browser console (F12) for errors
- Try a different browser

## 📚 Need More Help?

- Read SETUP.md for detailed instructions
- Check README.md for full documentation
- Review GAME_DESIGN.md to understand gameplay

## 🎉 You're Ready!

Start farming and making a difference! 🌱
