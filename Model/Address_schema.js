import mongoose from "mongoose";
import { type } from "os";

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Reference to the User schema
    required: true,
  },
  customerType: {
    type: String,
    enum: ["online", "offline"],
    default: "online",
  },
  street: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    requried: true,
  },
  landmark: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false, // Indicates if this is the default address for the user
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the `updatedAt` field before saving
addressSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const addressModel = mongoose.model("address", addressSchema);
