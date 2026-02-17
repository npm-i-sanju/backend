import { asyncHandler } from "../utils/asyncHendler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body

    const trimContent = await content?.trim()

    if (!trimContent) {
        throw new ApiError(404, "Content is required")
    }

    const newTweet = await Tweet.create({
        content: trimContent,
        owner: req.user._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, newTweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid UserId")
    }
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "No user found")
    }

    const userTweet = await Tweet.find(
        {
            owner: userId
        }
    ).sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, userTweet, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }
    const trimContent = await content?.trim()

    if (!trimContent) {
        throw new ApiError(400, "Content Is Required")
    }

    const updatedTweet = await Tweet.findOneAndUpdate({
        owner: req.user._id,
        _id: tweetId
    }, {
        content: trimContent
    }, {
        new: true
    })

    if (!updatedTweet) {
        throw new ApiError(400, "Tweet not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweeter updated") )


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
const {tweetId} = req.params

if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid id")
}

const deletedTweet = await Tweet.findOneAndDelete({
    owner: req.user._id,
    _id: tweetId
})

if (!deletedTweet) {
    throw new ApiError(400, "Tweet not found")
}

return res 
.status(200)
.json(new ApiResponse(200, deletedTweet, "Tweet removed"))




})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}