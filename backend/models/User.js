const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
      password: { 
      type: String,
      required: true,
      select: false, // Hide by default in queries
      validate: {
        validator: function(v) {
          // Basic check for bcrypt hash format
          return /^\$2[aby]\$\d+\$/.test(v);
        },
        message: props => `${props.value} is not a valid bcrypt hash!`
      }
    },
    role: { 
      type: String, 
      required: true, 
      enum: ['local', 'emergency', 'admin'],
      default: 'local'
    },
    isSuperlocal: {
        type: Boolean,
        default: false
      },
      reputationScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      contributions: {
        verified: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 }
      },
    lastActive: Date, // For reputation decay
    votingStats: {
      correctVotes: { type: Number, default: 0 },
      totalVotes: { type: Number, default: 0 }
    },
    // Remove the old verifiedLandmarksAdded setter and replace with:
    verifiedLandmarksAdded: {
      type: Number,
      default: 0
    },
    verifiedRoutesAdded: {
      type: Number,
      default: 0
    }
  });
// Add method to calculate weight
userSchema.methods.getVoteWeight = function() {
  let weight = 1.0; // Base weight
  
  // Super users (10+ correct votes) get highest weight
  if (this.isSuperlocal) {
    weight = 4.0;
  }
  // Users with high accuracy (but not yet superlocal) get higher weight
  else if (this.votingStats?.totalVotes > 0) {
    const accuracy = this.votingStats.correctVotes / this.votingStats.totalVotes;
    if (accuracy >= 0.8) {
      weight = 2.0;
    }
  }
  // Users with high reputation get higher weight
  else if (this.reputationScore >= 70) {
    weight = 2.0;
  }
  
  return weight;
};
// Add a method to check and update superlocal status
userSchema.methods.checkSuperlocalStatus = function() {
  const totalVerified = this.verifiedLandmarksAdded + this.verifiedRoutesAdded;
  // If the user has added 10 or more verified landmarks or routes, promote to superlocal
  if (totalVerified  >= 10 && !this.isSuperlocal) {
    this.isSuperlocal = true;
    return true; // Indicates status was changed
  }
  return false;
};
// Add post-save hook for voting-based promotion
userSchema.post('save', async function(doc, next) {
  if (doc.votingStats?.correctVotes >= 10 && !doc.isSuperlocal) {
    doc.isSuperlocal = true;
    await doc.save();
  }
  next();
});
// Password hashing middleware
userSchema.pre('save', function(next) {
  console.log('PRE-SAVE HOOK TRIGGERED'); // Debug 1
  if (this.isModified('password')) {
    console.log('Password modified detected:', this.password); // Debug 2
    if (!/^\$2[aby]\$\d+\$/.test(this.password)) {
      console.error('Invalid hash format detected!');
      throw new Error('Corrupted password hash detected');
    }
  }
  next();
});

// Replace the existing comparePassword method with:
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Validation schema
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(6).required().label("Password"),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().label("Confirm Password"),
    role: Joi.string().valid("local", "emergency", "admin").required().label("Role"),
  });
  return schema.validate(data);
};
// Run this once to initialize voting stats
const migrateVotingStats = async () => {
  const landmarks = await Landmark.find();
  
  for (const landmark of landmarks) {
    if (landmark.status === 'pending') continue;
    
    const finalOutcome = landmark.status === 'verified' ? 'yes' : 'no';
    
    for (const vote of landmark.votes) {
      await User.findByIdAndUpdate(vote.userId, {
        $inc: {
          'votingStats.totalVotes': 1,
          'votingStats.correctVotes': vote.vote === finalOutcome ? 1 : 0
        }
      });
    }
  }
  
  // Promote users who already have 10+ correct votes
  await User.updateMany(
    { 'votingStats.correctVotes': { $gte: 10 } },
    { $set: { isSuperlocal: true } }
  );
  
  console.log('Voting stats migration completed');
};
// With this cleaner version:
const User = mongoose.model('User', userSchema);
module.exports = {
  User,
  validateUser
};