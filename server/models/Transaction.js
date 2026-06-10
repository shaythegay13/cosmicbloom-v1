const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null after account deletion (transactions are anonymized)
  },
  type: {
    type: String,
    enum: ['purchase', 'charity_distribution'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  charityAmount: {
    type: Number,
    default: 0
  },
  charityPercentage: {
    type: Number,
    default: 10
  },
  charity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity'
  },
  provider: {
    type: String,
    enum: ['revenuecat', 'stripe_legacy'],
    default: 'revenuecat'
  },
  providerTransactionId: String,
  productId: String,
  stripePaymentId: String, // legacy field, kept for old records
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  description: String,
  metadata: {
    itemsPurchased: [{
      itemId: String,
      itemName: String,
      quantity: Number,
      price: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
