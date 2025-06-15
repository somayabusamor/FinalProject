const mongoose = require('mongoose');
const { User } = require('./User'); // Adjust the path as needed
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
  timestamp: {  // Add this required field
    type: Date,
    default: Date.now
  }
}, { _id: false });

const landmarkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  color: { type: String, default: '#8B4513' },
  imageUrl: { type: String, default: '' },
  verified: { type: Boolean, default: false },
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
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, { timestamps: true });
// Add pre-save hook for automatic verification
landmarkSchema.pre('save', function(next) {
  if (this.isModified('votes')) {
    this.updateVerificationStatus();
  }
  next();
});

// Add method to calculate verification
// models/Landmark.js
landmarkSchema.methods.updateVerificationStatus = async function() {
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

  // Dynamic threshold
  const requiredWeight = 5 + (0.2 * Math.max(0, this.votes.length));
  const safeTotal = Math.max(1, totalWeight);
  
  // Calculate confidence
  const participationScore = Math.min(1, totalWeight / (requiredWeight * 1.5)) * 50;
  const agreementScore = (yesWeight / safeTotal) * 50;
  const confidenceScore = Math.min(100, participationScore + agreementScore);

  // Update verification data
  this.verificationData = { 
    totalWeight, 
    yesWeight, 
    noWeight, 
    confidenceScore 
  };
  
  // Determine status
  let statusChanged = false;
  const previousStatus = this.status;
  
  if (totalWeight >= requiredWeight && (yesWeight / safeTotal) >= 0.8) {
    this.status = 'verified';
    this.verified = true;
    statusChanged = previousStatus !== 'verified';
  } else if (noWeight >= (requiredWeight * 0.6)) {
    this.status = 'rejected';
    this.verified = false;
  } else if (Math.abs(yesWeight - noWeight) < 2 && totalWeight >= 3) {
    this.status = 'disputed';
  } else {
    this.status = 'pending';
  }

  // If status changed to verified, update creator's count
  if (statusChanged && this.status === 'verified') {
    // Increment verifiedLandmarksAdded and contributions.verified
    await User.findByIdAndUpdate(
      this.createdBy,
      { 
        $inc: { 
          'verifiedLandmarksAdded': 1,
          'contributions.verified': 1 
        } 
      },
      { new: true } // Return the updated document

    );
  }
  // After determining verification status
  if (statusChanged) {
    // Update voting stats for all users who voted
    const finalOutcome = this.status === 'verified' ? 'yes' : 'no';
    
    await Promise.all(this.votes.map(async (vote) => {
      const user = await User.findById(vote.userId);
      if (!user) return;

      const userVoteCorrect = vote.vote === finalOutcome;
      
      await User.findByIdAndUpdate(vote.userId, {
        $inc: {
          'votingStats.totalVotes': 1,
          'votingStats.correctVotes': userVoteCorrect ? 1 : 0
        }
      });

      // Check for superlocal promotion
      const updatedUser = await User.findById(vote.userId);
      if (updatedUser.votingStats.correctVotes >= 10 && !updatedUser.isSuperlocal) {
        updatedUser.isSuperlocal = true;
        await updatedUser.save();
      }
    }));
  }
  // If status changed to rejected, update creator's count
  if (statusChanged && this.status === 'rejected') {
    await User.findByIdAndUpdate(
      this.createdBy,
      { 
        $inc: { 
          'contributions.rejected': 1 
        } 
      }
    );
  }
  
  return this;
};

module.exports = mongoose.model('Landmark', landmarkSchema);
