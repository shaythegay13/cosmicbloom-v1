// Payments: RevenueCat webhook (source of truth for IAP) + client sync.
// Native purchases happen via the RevenueCat SDK in the app; this endpoint
// receives server-to-server events, credits coins, records the transaction
// and allocates the charity share (we donate 10% of proceeds).
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Charity = require('../models/Charity');
const Transaction = require('../models/Transaction');
const PRODUCTS = require('../config/products');

const CHARITY_PERCENTAGE = parseInt(process.env.CHARITY_PERCENTAGE || '10', 10);

// @route   POST /api/payments/revenuecat/webhook
// @desc    RevenueCat server-to-server event notifications
// @access  Verified via shared Authorization header
router.post('/revenuecat/webhook', async (req, res) => {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected || req.headers.authorization !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.body && req.body.event;
  if (!event) return res.status(400).json({ error: 'Missing event' });

  try {
    // Dedupe: RevenueCat retries webhooks; transaction IDs are unique
    if (event.transaction_id) {
      const existing = await Transaction.findOne({
        providerTransactionId: event.transaction_id,
        status: { $ne: 'refunded' }
      });
      if (existing && event.type !== 'CANCELLATION' && event.type !== 'REFUND') {
        return res.json({ received: true, duplicate: true });
      }
    }

    const user = await User.findById(event.app_user_id).catch(() => null);

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'NON_RENEWING_PURCHASE':
      case 'RENEWAL': {
        const product = PRODUCTS[event.product_id];
        if (!user || !product) break;

        const price = event.price_in_purchased_currency || event.price || 0;
        const charityAmount = price * (CHARITY_PERCENTAGE / 100);

        user.coinCredits += product.coins;
        user.totalSpent += price;
        user.charityContribution += charityAmount;
        await user.save();

        if (user.selectedCharity) {
          await Charity.findByIdAndUpdate(user.selectedCharity, {
            $inc: { totalReceived: charityAmount }
          });
        }

        await Transaction.create({
          user: user._id,
          type: 'purchase',
          amount: price,
          charityAmount,
          charityPercentage: CHARITY_PERCENTAGE,
          charity: user.selectedCharity,
          provider: 'revenuecat',
          providerTransactionId: event.transaction_id,
          productId: event.product_id,
          status: 'completed',
          description: product.name
        });
        break;
      }

      case 'CANCELLATION':
      case 'REFUND':
      case 'EXPIRATION': {
        const tx = await Transaction.findOne({
          providerTransactionId: event.transaction_id,
          status: 'completed'
        });
        if (!tx) break;
        tx.status = 'refunded';
        await tx.save();
        const product = PRODUCTS[tx.productId];
        if (tx.user && product) {
          const refUser = await User.findById(tx.user);
          if (refUser) {
            refUser.coinCredits = Math.max(0, refUser.coinCredits - product.coins);
            refUser.totalSpent = Math.max(0, refUser.totalSpent - tx.amount);
            refUser.charityContribution = Math.max(0, refUser.charityContribution - tx.charityAmount);
            await refUser.save();
          }
          if (tx.charity) {
            await Charity.findByIdAndUpdate(tx.charity, {
              $inc: { totalReceived: -tx.charityAmount }
            });
          }
        }
        break;
      }

      default:
        break; // ignore other event types
    }

    res.json({ received: true });
  } catch (error) {
    console.error('RevenueCat webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/payments/sync
// @desc    Claim purchased coins into the client save (idempotent drain)
// @access  Private
router.post('/sync', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const claimed = user.coinCredits || 0;
    if (claimed > 0) {
      user.coinCredits = 0;
      await user.save();
    }
    res.json({ coins: claimed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/payments/catalog
// @desc    Product catalog (ids + coin amounts; prices come from the stores)
// @access  Public
router.get('/catalog', (req, res) => {
  res.json(Object.entries(PRODUCTS).map(([id, p]) => ({ id, ...p })));
});

// @route   GET /api/payments/history
// @desc    Get user's purchase history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId })
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
