import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
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
    default: false, 
  }
}, 
{ timestamps: true });

UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", UserSchema);

export default User;