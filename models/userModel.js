import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  followers: [{ type: mongoose.SchemaTypes.ObjectId, ref: "user" }],
  following: [{ type: mongoose.SchemaTypes.ObjectId, ref: "user" }],
  createdOn: { type: Date, default: Date.now() },
});

const User = mongoose.model("user", userSchema);

export default User;
