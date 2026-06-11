const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Game characters data
const characters = [
  {
    id: 'sunny',
    name: 'Sunny',
    description: 'The optimistic farmer who brings sunshine to every harvest',
    color: '#FFD700',
    bonus: 'crops_grow_10_percent_faster'
  },
  {
    id: 'luna',
    name: 'Luna',
    description: 'The night gardener who tends to moonlit crops',
    color: '#9370DB',
    bonus: 'night_crops_yield_double'
  },
  {
    id: 'terra',
    name: 'Terra',
    description: 'The earth whisperer connected to the soil',
    color: '#8B4513',
    bonus: 'soil_quality_bonus_15_percent'
  },
  {
    id: 'river',
    name: 'River',
    description: 'The water keeper who nurtures with flowing streams',
    color: '#4682B4',
    bonus: 'water_efficiency_20_percent'
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'The wise cultivator with ancient farming knowledge',
    color: '#2E8B57',
    bonus: 'experience_gain_25_percent'
  }
];

// @route   GET /api/game/characters
// @desc    Get all available characters
// @access  Public
router.get('/characters', (req, res) => {
  res.json(characters);
});

// @route   POST /api/game/select-character
// @desc    Select a character
// @access  Private
router.post('/select-character', auth, async (req, res) => {
  try {
    const { characterId } = req.body;

    if (!characters.find(c => c.id === characterId)) {
      return res.status(400).json({ error: 'Invalid character' });
    }

    const user = await User.findById(req.userId);
    user.selectedCharacter = characterId;
    
    // Initialize starting area if first time
    if (user.gameProgress.unlockedAreas.length === 0) {
      user.gameProgress.unlockedAreas.push('starter_farm');
    }

    await user.save();

    res.json({
      message: 'Character selected successfully',
      character: characters.find(c => c.id === characterId)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Loose sanity caps for the schema-2 snapshot (single-player game — the
// goal is rejecting corrupt/abusive payloads, not perfect anti-cheat).
function validateSnapshot(save) {
  if (!save || typeof save !== 'object' || save.schema !== 2) return 'bad schema';
  if (typeof save.coins !== 'number' || save.coins < 0 || save.coins > 100000000) return 'bad coins';
  if (typeof save.level !== 'number' || save.level < 1 || save.level > 1000) return 'bad level';
  if (save.farms && typeof save.farms !== 'object') return 'bad farms';
  for (const farm of Object.values(save.farms || {})) {
    if (typeof farm.restoration !== 'number' || farm.restoration < 0 || farm.restoration > 100) {
      return 'bad restoration';
    }
    if (farm.plots && Object.keys(farm.plots).length > 1000) return 'too many plots';
  }
  if (JSON.stringify(save).length > 300000) return 'snapshot too large';
  return null;
}

// @route   POST /api/game/save
// @desc    Save game progress (schema-2 snapshot, last-write-wins)
// @access  Private
router.post('/save', auth, async (req, res) => {
  try {
    const { gameProgress } = req.body;
    const error = validateSnapshot(gameProgress);
    if (error) return res.status(400).json({ error: `Invalid save: ${error}` });

    const user = await User.findById(req.userId).select('gameSave');
    // last-write-wins by saveVersion: ignore stale snapshots from another device
    if (user.gameSave && (user.gameSave.saveVersion || 0) > (gameProgress.saveVersion || 0)) {
      return res.json({ message: 'Stale save ignored', saveVersion: user.gameSave.saveVersion });
    }

    user.gameSave = gameProgress;
    user.markModified('gameSave');
    await user.save();

    res.json({ message: 'Game saved', saveVersion: gameProgress.saveVersion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/game/load
// @desc    Load game progress (schema-2 if present, else legacy schema-1)
// @access  Private
router.get('/load', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('gameSave gameProgress selectedCharacter');

    res.json({
      gameProgress: user.gameSave || user.gameProgress,
      selectedCharacter: user.selectedCharacter,
      character: characters.find(c => c.id === user.selectedCharacter)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
