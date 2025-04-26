import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username already exists"],
    trim: [true, "Username must be trimmed"],
    lowercase: [true, "Username must be lowercase"],
    index: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email already exists"],
    trim: [true, "Email must be trimmed"],
    lowercase: [true, "Email must be lowercase"],
  },
  fullname: {
    type: String,
    required: [true, "Full name is required"],
    index: true, 
  },
  avatar: {
    type: String, //cloudinary url
    default: "https://res.cloudinary.com/dqj0xgk8v/image/upload/v1698231234/avatars/default-avatar.png",
  },
  coverImage: {
    type: String, //cloudinary url
    default: "https://res.cloudinary.com/dqj0xgk8v/image/upload/v1698231234/avatars/default-cover.png",
  },
  watchHistory: {
    type: [Schema.Types.ObjectId],
    ref: "Video",
  },
  password: {
    type: String,
    required: [true, "Password is required"],

  },
  refreshToken: {
    type: String,
  },
}, {
    timestamps: true,   // Automatically add createdAt and updatedAt fields   
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id,
    username: this.username,
    email: this.email,
    fullname: this.fullname,},
    process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h" });
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" });
}
export const User = mongoose.model("User", userSchema)