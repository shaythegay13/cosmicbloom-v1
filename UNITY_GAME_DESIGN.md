# 🌱 Farm & Give 3D - Complete Game Design

## 🎮 Game Overview

**Title:** Farm & Give 3D
**Platform:** iOS (App Store)
**Genre:** 3D Voxel Farming Simulation
**Style:** Pixelated 3D, colorful, whimsical
**USP:** 10% of profits support real community gardens

---

## 👾 Characters (Alien Farmers)

### Design Style:
- **NOT human** - alien/creature-like beings
- **Small and cute** - chibi proportions
- **Voxel/blocky** style
- **Colorful** - bright, fun colors
- **Expressive** - big eyes, animated

### 5 Playable Characters:

#### ☀️ **Solara** (Sunny replacement)
- **Species:** Sun Sprite
- **Appearance:** Yellow/orange glow, antenna with sun symbol
- **Size:** 1.2 units tall
- **Ability:** Crops grow 10% faster
- **Personality:** Energetic, optimistic

#### 🌙 **Lunix** (Luna replacement)
- **Species:** Moon Wisp
- **Appearance:** Purple/blue, crescent moon marking, glowing eyes
- **Size:** 1.2 units tall
- **Ability:** Double yield at night
- **Personality:** Calm, mysterious

#### 🌍 **Terrix** (Terra replacement)
- **Species:** Earth Golem
- **Appearance:** Brown/green, rocky texture, moss patches
- **Size:** 1.3 units tall (slightly bigger)
- **Ability:** 15% better soil quality
- **Personality:** Steady, reliable

#### 💧 **Aquos** (River replacement)
- **Species:** Water Sprite
- **Appearance:** Blue/cyan, water droplet shape, flowing patterns
- **Size:** 1.1 units tall
- **Ability:** Water efficiency (splash to adjacent)
- **Personality:** Fluid, adaptable

#### 🧙 **Mystix** (Sage replacement)
- **Species:** Ancient Scholar
- **Appearance:** Purple robe, floating book, wise eyes
- **Size:** 1.2 units tall
- **Ability:** 25% more XP
- **Personality:** Wise, curious

---

## 🌾 Crops System (30+ Types)

### Categories:

#### 🥕 **Root Vegetables** (8 types)
1. Carrot - Orange, 2 days, 15 coins
2. Potato - Brown, 3 days, 20 coins
3. Beet - Red, 2.5 days, 18 coins
4. Radish - Pink, 1 day, 10 coins
5. Turnip - White/purple, 2 days, 16 coins
6. Parsnip - Cream, 3 days, 22 coins
7. Sweet Potato - Orange, 4 days, 25 coins
8. Ginger - Tan, 5 days, 30 coins

#### 🍅 **Fruits & Vegetables** (10 types)
9. Tomato - Red, 3 days, 20 coins
10. Cucumber - Green, 2 days, 15 coins
11. Pepper - Red/green, 3 days, 22 coins
12. Eggplant - Purple, 4 days, 25 coins
13. Pumpkin - Orange, 5 days, 35 coins
14. Watermelon - Green, 6 days, 40 coins
15. Strawberry - Red, 2 days, 18 coins
16. Blueberry - Blue, 3 days, 20 coins
17. Corn - Yellow, 4 days, 28 coins
18. Lettuce - Green, 1.5 days, 12 coins

#### 🌾 **Grains** (5 types)
19. Wheat - Golden, 3 days, 12 coins
20. Rice - White, 4 days, 15 coins
21. Oats - Tan, 3 days, 14 coins
22. Barley - Brown, 3.5 days, 16 coins
23. Quinoa - Red/white, 4 days, 20 coins

#### 🌻 **Flowers** (4 types)
24. Sunflower - Yellow, 3 days, 25 coins
25. Rose - Red, 4 days, 30 coins
26. Tulip - Various, 2 days, 20 coins
27. Lavender - Purple, 3 days, 22 coins

#### 🌿 **Herbs** (3 types)
28. Basil - Green, 2 days, 15 coins
29. Mint - Green, 2 days, 14 coins
30. Rosemary - Green, 3 days, 18 coins

### Crop Growth Stages:
- **Stage 1:** Seed planted (🌱)
- **Stage 2:** Sprout (🌿)
- **Stage 3:** Growing (🍃)
- **Stage 4:** Mature (🌾)
- **Stage 5:** Ready to harvest (✨)

### Growth Requirements:
- **Water:** Must water every stage
- **Sunlight:** Affected by weather
- **Temperature:** Some crops prefer certain seasons
- **Soil Quality:** Better soil = better yield

---

## 🌦️ Weather System

### Weather Types:

#### ☀️ **Sunny** (40% chance)
- Crops grow normally
- Water evaporates faster
- Best for most crops

#### ☁️ **Cloudy** (25% chance)
- Crops grow 10% slower
- Water lasts longer
- No special effects

#### 🌧️ **Rainy** (20% chance)
- Auto-waters all crops
- Some crops grow faster
- Mushrooms appear
- Can cause flooding if too much

#### ⛈️ **Storm** (5% chance)
- Can damage crops
- Strong wind effects
- Lightning (rare, can start fires)
- Animals hide

#### 🌨️ **Snow** (5% winter)
- Most crops die
- Only winter crops survive
- Animals need shelter
- Beautiful visual effect

#### 🌡️ **Heatwave** (5% summer)
- Crops need more water
- Some crops wilt
- Animals seek shade
- Fire risk

### Weather Cycle:
- Changes every 6-12 hours (real-time)
- Forecast system (predict next 24 hours)
- Seasonal patterns
- Player can build weather protection (greenhouse)

---

## 🐾 Animals System

### Domesticatable Animals (Can Tame):

#### 🐔 **Cluckbeast** (Chicken-like)
- **Size:** 0.5 units
- **Appearance:** Fluffy, colorful feathers, big eyes
- **Produces:** Eggs (daily)
- **Taming:** Feed seeds for 3 days
- **Care:** Needs food, water, shelter
- **Behavior:** Pecks ground, follows player when tamed

#### 🐄 **Mooble** (Cow-like)
- **Size:** 1.5 units
- **Appearance:** Round body, spots, small horns
- **Produces:** Milk (every 2 days)
- **Taming:** Feed grass for 5 days
- **Care:** Needs grass, water, barn
- **Behavior:** Grazes, moos, slow moving

#### 🐑 **Fluffpuff** (Sheep-like)
- **Size:** 1.0 units
- **Appearance:** Fluffy wool, bouncy
- **Produces:** Wool (every 3 days)
- **Taming:** Feed flowers for 4 days
- **Care:** Needs grass, water
- **Behavior:** Jumps around, eats flowers

#### 🐷 **Snortling** (Pig-like)
- **Size:** 0.8 units
- **Appearance:** Pink/brown, curly tail
- **Produces:** Truffles (rare, in forest)
- **Taming:** Feed vegetables for 3 days
- **Care:** Needs mud, food
- **Behavior:** Digs, rolls in mud

#### 🐝 **Buzzbit** (Bee-like)
- **Size:** 0.3 units (swarm)
- **Appearance:** Glowing, geometric wings
- **Produces:** Honey (daily from hive)
- **Taming:** Place hive, plant flowers
- **Care:** Needs flowers nearby
- **Behavior:** Flies between flowers, pollinates crops

### Wild Animals (Cannot Tame):

#### 🦊 **Sneakpaw** (Fox-like)
- **Size:** 0.7 units
- **Behavior:** Steals crops at night
- **Can:** Scare away with scarecrow
- **Drops:** Fur (if caught)

#### 🦝 **Banditmask** (Raccoon-like)
- **Size:** 0.6 units
- **Behavior:** Raids trash, steals food
- **Can:** Set traps
- **Drops:** Shiny objects

#### 🐦 **Wingflap** (Bird-like)
- **Size:** 0.4 units
- **Behavior:** Eats seeds, poops fertilizer
- **Can:** Build scarecrow
- **Drops:** Feathers

#### 🐛 **Crawlbit** (Bug-like)
- **Size:** 0.2 units
- **Behavior:** Eats crops
- **Can:** Use pesticide (organic)
- **Drops:** Bug parts (crafting)

---

## 🌳 Environmental Resources

### Gatherable Resources:

#### 🪨 **Rocks**
- **Types:** Small, medium, large
- **Uses:** Building, crafting, decoration
- **Tools:** Pickaxe (upgradeable)
- **Respawn:** 24 hours

#### 🌲 **Trees**
- **Types:** Oak, Pine, Birch, Fruit trees
- **Uses:** Wood, fruit, decoration
- **Tools:** Axe (upgradeable)
- **Regrow:** 3-7 days

#### 🌾 **Grass**
- **Types:** Short, tall, wheat grass
- **Uses:** Animal feed, decoration
- **Tools:** Scythe
- **Regrow:** Daily

#### 🌿 **Shrubs**
- **Types:** Berry bush, flower bush
- **Uses:** Berries, flowers, decoration
- **Tools:** Shears
- **Regrow:** 2-3 days

#### 💐 **Wild Flowers**
- **Types:** Various colors
- **Uses:** Decoration, bee food, crafting
- **Tools:** Hand pick
- **Regrow:** Daily

#### 🍄 **Mushrooms**
- **Types:** Common, rare, magical
- **Uses:** Food, crafting, selling
- **Tools:** Hand pick
- **Spawn:** After rain, in forest

---

## 🛠️ Crafting & Building

### Tools (Upgradeable):

1. **Hoe** - Till soil (Wood → Stone → Iron → Gold)
2. **Watering Can** - Water crops (Small → Medium → Large → Auto)
3. **Axe** - Chop trees (Wood → Stone → Iron → Gold)
4. **Pickaxe** - Mine rocks (Wood → Stone → Iron → Gold)
5. **Scythe** - Cut grass (Wood → Stone → Iron)
6. **Shears** - Trim shrubs (Iron → Gold)

### Buildings:

1. **Barn** - Store animals (Wood x20, Stone x10)
2. **Silo** - Store crops (Wood x15, Stone x15)
3. **Greenhouse** - Weather protection (Glass x20, Wood x10)
4. **Well** - Auto-water nearby crops (Stone x30, Iron x5)
5. **Windmill** - Process grains (Wood x25, Stone x20, Iron x10)
6. **Beehive** - Honey production (Wood x10)
7. **Fence** - Keep animals in (Wood x5 per piece)
8. **Scarecrow** - Scare birds (Wood x5, Cloth x2)

---

## 🎨 Art Style

### Visual Design:

- **Voxel-based:** Everything made of cubes/blocks
- **Low-poly:** Simple geometry
- **Bright colors:** Saturated, cheerful palette
- **Soft shadows:** Not too harsh
- **Particle effects:** Sparkles, dust, water splashes
- **Smooth animations:** Despite blocky look

### Color Palette:

- **Grass:** #7EC850 (bright green)
- **Soil:** #8B4513 (rich brown)
- **Sky:** #87CEEB (sky blue)
- **Water:** #4A90E2 (clear blue)
- **Characters:** Various bright colors
- **UI:** White with colorful accents

---

## 📱 Mobile Controls (iOS)

### Touch Controls:

- **Virtual Joystick** (left side) - Movement
- **Action Buttons** (right side):
  - 🔨 Tool button
  - 💼 Inventory
  - 🗺️ Map
  - ⚙️ Settings

### Gestures:

- **Tap:** Interact with object
- **Hold:** Use tool continuously
- **Pinch:** Zoom camera
- **Swipe:** Rotate camera
- **Double-tap:** Quick action

---

## 🎯 Game Loop

### Daily Cycle:

1. **Morning (6 AM):**
   - Check weather
   - Water crops
   - Feed animals
   - Collect products

2. **Afternoon (12 PM):**
   - Plant new crops
   - Gather resources
   - Build/craft
   - Explore

3. **Evening (6 PM):**
   - Final watering
   - Harvest ready crops
   - Sell products
   - Plan next day

4. **Night (10 PM):**
   - Animals sleep
   - Some crops grow faster (Luna bonus)
   - Wild animals appear
   - Stars visible

---

## 💰 Economy

### Income Sources:

- Selling crops
- Animal products
- Crafted items
- Completing quests
- Daily rewards

### Expenses:

- Seeds
- Tools
- Buildings
- Animal food
- Upgrades

### Charity System:

- 10% of all sales → Selected community garden
- Track donations in-app
- See garden impact
- Monthly reports

---

## 🌐 Backend Integration

### API Endpoints (Existing):

- User authentication
- Character selection
- Save/load game state
- Charity selection
- Payment processing
- Leaderboards

### New Endpoints Needed:

- Weather sync
- Marketplace
- Friend system
- Events/challenges

---

## 🎮 Next Development Steps:

1. ✅ Unity setup
2. ✅ Basic character movement
3. 🔲 Crop planting system
4. 🔲 Weather implementation
5. 🔲 Animal AI
6. 🔲 Resource gathering
7. 🔲 Crafting system
8. 🔲 UI/UX design
9. 🔲 Backend connection
10. 🔲 iOS build & testing

---

**This is your complete 3D game design!** Ready to build it in Unity! 🚀🌱
