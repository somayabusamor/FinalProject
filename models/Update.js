const mongoose = require("mongoose");
const Joi = require("joi");

const UpdateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  villageName: { type: String, required: true },
  updateType: {
    type: String,
    enum: ["new building", "new road", "other"],
    required: true,
  },
  description: { type: String, required: true },
  images: [{ type: String }], // Array of image paths
  createdAt: { type: Date, default: Date.now }, // Automatically add a timestamp
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

// Validation schema
const validateUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    villageName: Joi.string().required().label("Village Name"),
    updateType: Joi.string()
      .valid("new building", "new road", "other")
      .required()
      .label("Update Type"),
    description: Joi.string().required().label("Description"),
    images: Joi.array().items(Joi.string()).label("Images"),
  });
  return schema.validate(data);
};

// Create and export the model
const Update = mongoose.model("Update", UpdateSchema);

module.exports = { Update, validateUpdate };
