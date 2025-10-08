const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  selectedCharacter: {
    type: String,
    enum: {
      values: ['sunny', 'luna', 'terra', 'river', 'sage'],
      message: '{VALUE} is not a valid character'
    },
    default: undefined
  },
  gameProgress: {
    level: { type: Number, default: 1 },
    coins: { type: Number, default: 100 },
    experience: { type: Number, default: 0 },
    unlockedAreas: [{ type: String }],
    inventory: [{
      itemId: String,
      quantity: Number
    }],
    farm: {
      plots: [{
        x: Number,
        y: Number,
        crop: String,
        plantedAt: Date,
        wateredAt: Date,
        stage: { type: Number, default: 0 }
      }]
    }
  },
  selectedCharity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    default: null
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  charityContribution: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
