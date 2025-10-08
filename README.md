# Farm & Give 🌱

A charming farming game where players choose from 5 unique characters and farm around the world. What makes this special: **10% of all profits go directly to local community gardens, urban farms, and agricultural initiatives.**

**Now integrated with the [American Community Gardening Association (ACGA)](https://www.communitygarden.org)** - supporting real community gardens across the United States!

## 🎮 Game Features

- **5 Unique Characters**: Choose your favorite farmer avatar
- **Simple Pixel Art Style**: Inspired by games like Cosmic Coop
- **Farming Mechanics**: Plant, water, harvest crops
- **World Exploration**: Travel to different farming regions
- **Community Impact**: 10% of profits support real ACGA-affiliated community gardens
- **Real Gardens**: Choose from 15+ verified community garden organizations

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- Stripe Payment Integration

### Frontend
- HTML5 Canvas for game rendering
- Vanilla JavaScript (ES6+)
- CSS3 for UI styling
- Responsive design

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd windsurf-project
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run the application**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## 🎯 Game Mechanics

### Characters
1. **Sunny** - The optimistic farmer
2. **Luna** - The night gardener
3. **Terra** - The earth whisperer
4. **River** - The water keeper
5. **Sage** - The wise cultivator

### Farming System
- Plant seeds in tilled soil
- Water crops daily
- Harvest when ready
- Sell produce for coins
- Unlock new areas and crops

### Charity System
- 10% of all in-game purchases
- Automatically tracked and allocated
- Users can select their local community garden
- Quarterly distributions to registered organizations

## 📁 Project Structure

```
windsurf-project/
├── server/
│   ├── index.js              # Express server entry point
│   ├── config/               # Configuration files
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   └── utils/                # Utility functions
├── client/
│   ├── index.html            # Main HTML file
│   ├── css/
│   │   └── styles.css        # Game styling
│   ├── js/
│   │   ├── game.js           # Main game engine
│   │   ├── player.js         # Player class
│   │   ├── world.js          # World/map system
│   │   ├── farming.js        # Farming mechanics
│   │   ├── ui.js             # UI components
│   │   └── api.js            # API client
│   └── assets/
│       ├── sprites/          # Character and object sprites
│       └── audio/            # Sound effects and music
├── package.json
├── .env.example
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Game
- `GET /api/game/characters` - Get all characters
- `POST /api/game/save` - Save game progress
- `GET /api/game/load` - Load game progress

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments/history` - Get payment history

### Charity
- `GET /api/charity/organizations` - Get community gardens list
- `POST /api/charity/select` - Select user's local garden
- `GET /api/charity/impact` - Get charity impact stats

## 🌍 Community Impact

This game is built on the principle of giving back. Every purchase made in-game contributes to real-world community gardens and urban farms, helping to:

- Support local food production
- Create green spaces in urban areas
- Educate communities about sustainable farming
- Provide fresh produce to underserved neighborhoods

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Inspired by Cosmic Coop's simple, charming aesthetic
- Built with love for farming and community support
