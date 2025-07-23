const mechanicService = require("../../services/mechanicService");

const getMechanics = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const mechanics = await mechanicService.getMechanics(page, limit, userId);
    res.json(mechanics);
  } catch (err) {
    console.log(err);
  }
};

const getReviews = async (req, res) => {
  const { selectedMech } = req.params;
  try {
    const posts = await mechanicService.getReviews(selectedMech);

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
};
const getComments = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await mechanicService.getComments(postId);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
};
const getPosts = async (req, res) => {
  const userId = req.user._id.toString();
  
  const { MechId } = req.params;
  try {
    const posts = await mechanicService.getPosts(MechId, userId);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
};

const deletemedia = async (req, res) => {
  try {
    

    const userId = req.user.id;
    const {postId} = req.body;
    console.log(postId)
    console.log(userId)
    const result = mechanicService.deletemedia(
      postId,
      userId
    );
    res.status(200).json({result, message: "Post updated Successfully"});
  } catch (err) {
    console.log(err);
  }
};
const postmedia = async (req, res) => {
  console.log("Origin Header:", req.get("Origin"));

  try {
    if (!req.files) {
      return res.status(300).json({ message: "No images or videos uploaded" });
    }
    const media = req.files.images || req.files.videos;

    const userId = req.user.id;
    const bio = req.body.bio;
    const result = mechanicService.postmedia(
      media[0].id.toString(),
      bio,
      userId
    );
    res.status(200).json({result, message: "Post updated Successfully"});
  } catch (err) {
    console.log(err);
  }
};

const postComment = async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const { post, comment } = req.body;
    const result = await mechanicService.postComment(post, comment, userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
  }
};
const postLikes = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const post = req.body.post;
    const result = await mechanicService.postLikes(post, userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userData = req.body;
    console.log('userData :', userData)
    const result = await mechanicService.editProfile(userData, userId);
    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
  }
};
const postReviews = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userReview = req.body;
    const result = await mechanicService.postReviews(userReview, userId);
    res.status(200).json({ result, message : "Review Added Successfully" });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getMechanics,
  postmedia,
  getPosts,
  postLikes,
  postReviews,
  getReviews,
  postComment,
  getComments,
  editProfile,
  deletemedia
};
