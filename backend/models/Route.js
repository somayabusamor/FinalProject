const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  vote: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  weight: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const routeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  points: [{
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  }],
  color: { 
    type: String, 
    default: '#3A86FF',
    validate: {
      validator: (v) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
      message: props => `${props.value} is not a valid color!`
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'disputed'],
    default: 'pending'
  },
  verificationData: {
    totalWeight: Number,
    yesWeight: Number,
    noWeight: Number,
    confidenceScore: Number
  },
  votes: [voteSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Add pre-save hook for automatic verification
routeSchema.pre('save', function(next) {
  if (this.isModified('votes')) {
    this.updateVerificationStatus();
  }
  next();
});

// Add method to calculate verification
routeSchema.methods.updateVerificationStatus = async function() {
  try {
    const now = new Date();
    
    // Calculate weights with decay
    const { totalWeight, yesWeight, noWeight } = this.votes.reduce((acc, vote) => {
      const voteTime = vote.timestamp || now;
      const hoursOld = (now - voteTime) / (1000 * 60 * 60);
      const decayFactor = Math.exp(-0.005 * hoursOld);
      const effectiveWeight = (vote.weight || 1) * decayFactor;
      
      return {
        totalWeight: acc.totalWeight + effectiveWeight,
        yesWeight: vote.vote === 'yes' ? acc.yesWeight + effectiveWeight : acc.yesWeight,
        noWeight: vote.vote === 'no' ? acc.noWeight + effectiveWeight : acc.noWeight
      };
    }, { totalWeight: 0, yesWeight: 0, noWeight: 0 });

    const requiredWeight = 5 + (0.2 * Math.max(0, this.votes.length));
    const safeTotal = Math.max(1, totalWeight);
    
    // Update verification data
    this.verificationData = { 
      totalWeight, 
      yesWeight, 
      noWeight, 
      confidenceScore: Math.min(100, (yesWeight / safeTotal) * 100)
    };
    
    // Determine status
    const previousStatus = this.status;
    
    if (totalWeight >= requiredWeight && (yesWeight / safeTotal) >= 0.8) {
      this.status = 'verified';
      this.verified = true;
      
      if (previousStatus !== 'verified') {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(
          this.createdBy,
          { $inc: { verifiedRoutesAdded: 1 } },
          { new: true }
        );
      }
    } else if (noWeight >= (requiredWeight * 0.6)) {
      this.status = 'rejected';
      this.verified = false;
    } else if (Math.abs(yesWeight - noWeight) < 2 && totalWeight >= 3) {
      this.status = 'disputed';
    } else {
      this.status = 'pending';
    }

    // If status changed to verified, update creator's count
    // (statusChanged is not defined in your code, so this block is commented out or should be implemented properly)
    // if (statusChanged && this.status === 'verified') {
    //   await mongoose.model('User').findByIdAndUpdate(
    //     this.createdBy,
    //     { 
    //       $inc: { 
    //         'verifiedRoutesAdded': 1,
    //         'contributions.verified': 1 
    //       } 
    //     }
    //   );
    // }
    
    return this;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('Route', routeSchema);