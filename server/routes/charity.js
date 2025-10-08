const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Charity = require('../models/Charity');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { findNearestGardens, findGardensInRadius } = require('../utils/geolocation');

// @route   GET /api/charity/organizations
// @desc    Get all verified charity organizations
// @access  Public
router.get('/organizations', async (req, res) => {
  try {
    const { city, state, type } = req.query;
    
    let query = { verified: true };
    
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (type) query.type = type;

    const charities = await Charity.find(query)
      .select('-__v')
      .sort({ supporters: -1 });

    res.json(charities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/charity/:id
// @desc    Get single charity organization
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    res.json(charity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/charity/select
// @desc    Select user's preferred charity
// @access  Private
router.post('/select', auth, async (req, res) => {
  try {
    const { charityId } = req.body;

    const charity = await Charity.findById(charityId);
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    const user = await User.findById(req.userId);
    const previousCharity = user.selectedCharity;
    
    user.selectedCharity = charityId;
    await user.save();

    // Update supporter counts
    if (previousCharity && previousCharity.toString() !== charityId) {
      await Charity.findByIdAndUpdate(previousCharity, { $inc: { supporters: -1 } });
    }
    
    if (!previousCharity || previousCharity.toString() !== charityId) {
      await Charity.findByIdAndUpdate(charityId, { $inc: { supporters: 1 } });
    }

    res.json({
      message: 'Charity selected successfully',
      charity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/charity/impact
// @desc    Get overall charity impact statistics
// @access  Public
router.get('/stats/impact', async (req, res) => {
  try {
    const totalDonations = await Transaction.aggregate([
      { $match: { type: 'purchase', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$charityAmount' } } }
    ]);

    const totalCharities = await Charity.countDocuments({ verified: true });
    const totalSupporters = await User.countDocuments({ selectedCharity: { $ne: null } });

    const topCharities = await Charity.find({ verified: true })
      .sort({ totalReceived: -1 })
      .limit(5)
      .select('name totalReceived supporters location.city location.state');

    res.json({
      totalDonated: totalDonations[0]?.total || 0,
      totalCharities,
      totalSupporters,
      topCharities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/charity/my-impact
// @desc    Get user's personal charity impact
// @access  Private
router.get('/my-impact', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('selectedCharity');
    
    const userTransactions = await Transaction.find({
      user: req.userId,
      type: 'purchase',
      status: 'completed'
    }).sort({ createdAt: -1 });

    res.json({
      totalContributed: user.charityContribution,
      selectedCharity: user.selectedCharity,
      transactionCount: userTransactions.length,
      recentTransactions: userTransactions.slice(0, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/charity/nearest
// @desc    Find nearest community gardens to user's location
// @access  Public
router.get('/nearest', async (req, res) => {
  try {
    const { lat, lng, radius, limit } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required',
        example: '/api/charity/nearest?lat=40.7128&lng=-74.0060&limit=10'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchLimit = parseInt(limit) || 10;
    const searchRadius = parseFloat(radius);

    // Validate coordinates
    if (isNaN(userLat) || isNaN(userLng) || userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Get all verified charities
    const allCharities = await Charity.find({ verified: true });

    let results;
    if (searchRadius && !isNaN(searchRadius)) {
      // Find gardens within radius
      results = findGardensInRadius(allCharities, userLat, userLng, searchRadius);
    } else {
      // Find nearest gardens
      results = findNearestGardens(allCharities, userLat, userLng, searchLimit);
    }

    res.json({
      userLocation: { lat: userLat, lng: userLng },
      count: results.length,
      gardens: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
