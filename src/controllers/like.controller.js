import { asyncHandler } from "../utils/asyncHendler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js"
import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";


const videoLike = asyncHandler(async (req, res) => {

    const { VideoId } = req.params // video id validation

    if (!VideoId || !isValidObjectId(VideoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const video = await Video.findById(VideoId) // check video existence

    if (!video) {
        throw new ApiError(404, "Video not found")

    }


    const existingLike = await Like.findOne({
        video: VideoId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "liked removed successfully"))
    } else {
        const newLike = await Like.create({
            video: VideoId,
            likedBy: req.user._id
        })

        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: true }, "liked add successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId) // check comment existence

    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    const existingCommentLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })
    // unlike comment
    if (existingCommentLike) {
        await Like.findByIdAndDelete(existingCommentLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { isComment: false }, " commented like removed successfully"))
        // like comment
    } else {
        await Comment.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, { isComment: true }, "like add successfully"))
    }



})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
//Check tweet exists
//Check existing like
//UNLIKE
// LIKE
    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const existingTweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    // unlike tweet

    if (existingTweetLike) {
        await Like.findByIdAndDelete(existingTweetLike._id)
        return res
            .status(200)
           .json(new ApiResponse(200, { isLiked: false }, "Tweet like removed"));
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Tweet liked successfully"))
    }



}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
// find like of logged-in user

const likedVideo = await Like.find({
    likedBy: req.user._id,
    video: {$ne:null} 
})
.populate({
    path:"video",
    select : "-__v"
})
.select("video");
return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideo.map(like => like.video), // return only videos
        "Liked videos fetched successfully"
      )
    )

})

export { videoLike, toggleCommentLike, toggleTweetLike, getLikedVideos }