const mongoose = require('mongoose');
const Joi = require('joi');

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['local', 'emergency', 'admin'], // القيم المسموحة
      default: 'local'  }, // Default role

  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Validation schem\
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(6).required().label("Password"),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().label("Confirm Password"),
    role: Joi.string().valid("local", "emergency").required().label("Role"),
  });
  return schema.validate(data);
};


// Export the User model and validation function
const User = mongoose.model('User', userSchema);

module.exports = { User, validateUser };
