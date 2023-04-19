import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db.js";
import User from "./models/userModel.js";
import generateToken from "./generateToken.js";
import protect from "./authMiddleware.js";
import Comment from "./models/commentModel.js";
import Post from "./models/postModel.js";

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("App is running");
});

app.get("/api/users", async (req, res) => {
  const users = await User.find().select("-password");

  res.status(200).json(users);
});

app.post("/api/register", async (req, res) => {
  const { username, email, password, profilePicture } = req.body;

  if (!username || !email || !password) {
    return res.json("input all the neccessary fields");
  }

  const usernameTaken = await User.findOne({ username });

  if (usernameTaken) {
    return res.status(400).json("This username has been taken. please change");
  }

  try {
    const user = await User.create({
      username,
      email,
      password,
      profilePicture,
    });

    if (user) {
      res.status(200).json({
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        createdOn: user.createdOn,
        following: user.following,
        followers: user.followers,
        _id: user._id,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json("User not created");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json("input all the neccessary fields");
  }

  try {
    const user = await User.findOne({ username, password });

    if (user) {
      res.status(200).json({
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        createdOn: user.createdOn,
        following: user.following,
        followers: user.followers,
        _id: user._id,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json("Could not find this account");
    }
  } catch (error) {
    console.log(error.message);
  }
});

// app.put("/api/updateprofile", protect, async (req, res) => {
// const { newUsername, newProfilePicture } = req.body;

// if (!newUsername && !newProfilePicture) {
//   return res.json("input all neccessary fields");
// }

// if (newUsername !== "" && newProfilePicture !== "") {
//   try {
//     const updatedProfile = await User.findByIdAndUpdate(
//       req.loggeduser._id,
//       {
//         username: newUsername,
//         profilePicture: newProfilePicture,
//       },
//       { new: true }
//     );

//     if (updatedProfile) {
//       res.status(200).json(updatedProfile);
//     } else {
//       res.status(400).json("could not upadate this account");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// if (newUsername !== "" && newProfilePicture === "") {
//   try {
//     const updatedProfile = await User.findByIdAndUpdate(
//       req.loggeduser._id,
//       {
//         username: newUsername,
//       },
//       { new: true }
//     );

//     if (updatedProfile) {
//       res.status(200).json(updatedProfile);
//     } else {
//       res.status(400).json("could not upadate this account");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// if (newUsername === "" && newProfilePicture !== "") {
//   try {
//     const updatedProfile = await User.findByIdAndUpdate(
//       req.loggeduser._id,
//       {
//         profilePicture: newProfilePicture,
//       },
//       { new: true }
//     );

//       if (updatedProfile) {
//         res.status(200).json(updatedProfile);
//       } else {
//         res.status(400).json("could not upadate this account");
//       }
//     } catch (error) {
//       console.log(error.message);
//     }
//   }
// });

// app.delete("/api/deleteaccount", protect, async (req, res) => {
//   const deleted = await User.findByIdAndDelete(req.loggeduser._id);
//   if (deleted) {
//     res.json(deleted);
//   } else {
//     res.json("could not delete account");
//   }
// });

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "-password");

    if (posts) {
      res.status(200).json(posts);
    } else {
      res.status(400).json("could not fetch posts");
    }
  } catch (err) {
    console.log(err.messgae);
  }
});

app.post("/api/uploadpost", protect, async (req, res) => {
  const { description, video, isCommentable } = req.body;

  if (!video) {
    return res.json("Input Your video");
  }

  try {
    const post = await Post.create({
      author: req.loggeduser._id,
      description,
      video,
      isCommentable,
    }).then((post) => post.populate("author", "-password"));

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(400).json("could not create this post");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.put("/api/likepost", async (req, res) => {
  const post = await Post.findById(req.body.postId);
  post.likes++;
  post.save();

  res.status(200).json(post);
});

app.get("/api/comments", async (req, res) => {
  const { postId } = req.body;
  const comments = await Comment.find({ post: postId }).populate("post");
  if (comments) {
    res.status(200).json(comments);
  } else {
    res.status(400).json("COuld not get comments");
  }
});

app.post("/api/uploadcomment", protect, async (req, res) => {
  const { postId, content } = req.body;

  if (!postId || !content) {
    return res.status(400).json("input all the neccessary fields");
  }

  const post = await Post.findById(postId);
  if (!post.isCommentable) {
    console.log(post.isCommentable);
    return res.json("The poster blocked commenting for this post");
  }

  const comment = await Comment.create({
    post: postId,
    content,
    author: req.loggeduser._id,
  })
    .then((comment) => comment.populate("author", "-password"))
    .then((comment) => comment.populate("post"));

  if (comment) {
    res.status(200).json(comment);
    comment.populate("post");
  }
});

app.put("/api/likecomment", async (req, res) => {
  const { commentId } = req.body;
  const comment = await Comment.findById(commentId);
  if (comment) {
    comment.likes++;
    comment.save();
    res.status(200).json(comment);
  } else {
    res.status(400).json("C0uld not like comment");
  }
});

app.get("/api/getauserposts", async (req, res) => {
  const { userId } = req.query;

  const posts = await Post.find({ author: userId }).populate(
    "author",
    "-password"
  );
  if (posts) {
    res.status(200).json(posts);
  } else {
    res.status(400).json("COuld not fetch videos");
  }
});

app.put("/api/followauser", protect, async (req, res) => {
  const { userId } = req.body;
  const usertoFollow = await User.findById(userId);
  await User.findByIdAndUpdate(
    userId,
    {
      $push: { followers: req.loggeduser._id },
    },
    { new: true }
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.loggeduser._id,
    {
      $push: { following: usertoFollow },
    },
    { new: true }
  )
    .populate("following", "-password")
    .populate("followers", "-password");
  if (updatedUser) {
    res.status(200).json(updatedUser);
  } else {
    res.status(400).json("COuld not perform request actions");
  }
});

app.put("/api/unfollowauser", protect, async (req, res) => {
  // const user = User.findById(req.body.userId);
  await User.findByIdAndUpdate(
    req.body.userId,
    {
      $pull: { followers: req.loggeduser._id },
    },
    { new: true }
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.loggeduser._id,
    {
      $pull: { following: req.body.userId },
    },
    { new: true }
  )
    .populate("following", "-password")
    .populate("followers", "-password");
  if (updatedUser) {
    res.status(200).json(updatedUser);
  } else {
    res.status(400).json("COuld not perorm requested action");
  }
});

app.listen(3001, () => {
  console.log("app is running");
});
