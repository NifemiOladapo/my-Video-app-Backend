import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
  description: { type: String },
  video: { type: String, required: true },
  likes: { type: Number, default: 0 },
  isCommentable: { type: Boolean, default: true },
  createdOn: { type: Date, default: Date.now() },
});

const Post = mongoose.model("post", postSchema);

export default Post;
