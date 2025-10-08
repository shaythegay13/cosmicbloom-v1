const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Charity = require('../models/Charity');

// @route   POST /api/payments/create-intent
// @desc    Create a payment intent for in-game purchase
// @access  Private
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { amount, items } = req.body; // amount in cents

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findById(req.userId);
    
    // Calculate charity amount (10%)
    const charityPercentage = parseInt(process.env.CHARITY_PERCENTAGE) || 10;
    const charityAmount = Math.floor(amount * (charityPercentage / 100));

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId: user._id.toString(),
        charityAmount: charityAmount.toString(),
        items: JSON.stringify(items)
      }
    });

    // Create transaction record
    const transaction = new Transaction({
      user: user._id,
      type: 'purchase',
      amount: amount / 100, // Convert to dollars
      charityAmount: charityAmount / 100,
      charityPercentage,
      charity: user.selectedCharity,
      stripePaymentId: paymentIntent.id,
      status: 'pending',
      description: 'In-game purchase',
      metadata: { itemsPurchased: items }
    });

    await transaction.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment processing error' });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and update user account
// @access  Private
router.post('/confirm', auth, async (req, res) => {
  try {
    const { transactionId, paymentIntentId } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.status = 'completed';
    await transaction.save();

    // Update user totals
    const user = await User.findById(req.userId);
    user.totalSpent += transaction.amount;
    user.charityContribution += transaction.charityAmount;

    // Add purchased items to inventory
    if (transaction.metadata.itemsPurchased) {
      transaction.metadata.itemsPurchased.forEach(item => {
        const existingItem = user.gameProgress.inventory.find(
          i => i.itemId === item.itemId
        );
        
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          user.gameProgress.inventory.push({
            itemId: item.itemId,
            quantity: item.quantity
          });
        }
      });
    }

    await user.save();

    // Update charity total if user has selected one
    if (user.selectedCharity) {
      await Charity.findByIdAndUpdate(user.selectedCharity, {
        $inc: { totalReceived: transaction.charityAmount }
      });
    }

    res.json({
      message: 'Payment confirmed successfully',
      transaction,
      charityContribution: transaction.charityAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment confirmation error' });
  }
});

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
      type: 'purchase'
    })
      .populate('charity', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
