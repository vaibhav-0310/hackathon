import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  profilePicture: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  likedModels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ModelData",
    }
  ],

  savedModels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ModelData",
    }
  ],

  subscribed: {
    type: Boolean,
    default: false, // user is unsubscribed by default
  }

}, { timestamps: true });

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
