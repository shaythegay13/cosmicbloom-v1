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

// @route   POST /api/game/save
// @desc    Save game progress
// @access  Private
router.post('/save', auth, async (req, res) => {
  try {
    const { gameProgress } = req.body;

    const user = await User.findById(req.userId);
    
    // Update game progress
    if (gameProgress.level) user.gameProgress.level = gameProgress.level;
    if (gameProgress.coins !== undefined) user.gameProgress.coins = gameProgress.coins;
    if (gameProgress.experience !== undefined) user.gameProgress.experience = gameProgress.experience;
    if (gameProgress.inventory) user.gameProgress.inventory = gameProgress.inventory;
    if (gameProgress.farm) user.gameProgress.farm = gameProgress.farm;
    if (gameProgress.unlockedAreas) user.gameProgress.unlockedAreas = gameProgress.unlockedAreas;

    await user.save();

    res.json({
      message: 'Game saved successfully',
      gameProgress: user.gameProgress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/game/load
// @desc    Load game progress
// @access  Private
router.get('/load', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('gameProgress selectedCharacter');
    
    res.json({
      gameProgress: user.gameProgress,
      selectedCharacter: user.selectedCharacter,
      character: characters.find(c => c.id === user.selectedCharacter)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
