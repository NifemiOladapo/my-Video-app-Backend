import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
  post: { type: mongoose.SchemaTypes.ObjectId, ref: "post" },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  createdOn: { type: Date, default: Date.now() },
});

const Comment = mongoose.model("comment", commentSchema);

export default Comment;
