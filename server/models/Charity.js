const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['community_garden', 'urban_farm', 'agricultural_initiative'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  acgaAffiliated: {
    type: Boolean,
    default: false,
    description: 'Whether this garden is affiliated with American Community Gardening Association'
  },
  acgaId: {
    type: String,
    description: 'ACGA database ID if available'
  },
  totalReceived: {
    type: Number,
    default: 0
  },
  supporters: {
    type: Number,
    default: 0
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Charity', charitySchema);
