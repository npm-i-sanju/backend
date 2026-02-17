import {asyncHandler} from "../utils/asyncHendler.js"
import ApiResponse from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"



const getVideoComments = asyncHandler(async(req, res) => {
// get all comments for video

//Extract videoId from URL parameters (e.g., /videos/:videoId/comments)
const {videoId} =  req.params
//Extract pagination parameters from query string (e.g., ?page=1&limit=10)
//Default to page 1 and 10 items per page if not provided
const {page = 1 , limit = 10} = req.query
//Validate that videoId exists and is a valid MongoDB ObjectId
//
if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Provide")
    
}
//Check if the video exists in the database
const video = await Video.findById(videoId)
//If video doesn't exist, throw error
if (!video) {
    throw new ApiError(400, "Video dose not exist")
}
// Configure pagination options for mongoose-aggregate-paginate
const options = {
    page: Number(page),  // Current page number
    limit: Number(limit) // Number of items per page
    
}

// write pipeline
//STAGE 1: Filter comments that belong to this specific video
//STAGE 2: Join with users collection to get comment owner details
 //STAGE 3: Convert owner array to a single object
 //$lookup returns an array, but we only need the first (and only) element
//STAGE 4: Exclude sensitive fields from the response
 // Remove refreshToken and password from owner object
// Execute aggregation pipeline with pagination
// Send successful response with paginated comments
 const commentAggregate = Comment.aggregate([
    {
        $match: {
            video: new mongoose.Types.ObjectId(videoId)
        }
    },{
        $lookup: {
            from :"users", // Collection to join with
            localField: "owner",//Field from Comment collection
            foreignField: "_id",//Field from users collection
            as: "owner"//Name for the joined data array
        }
    },{
        $addFields:{
            owner:{
                $first:"$owner" // Get first element from owner array
            }
        }
    },{
        $project:{
            "owner.refreshToken" : 0, // Don't send refresh token
            "owner.password": 0 //  Don't send password
        }
    }
])

const paginatedComment = await Comment.aggregatePaginate(
    commentAggregate,
    options
)
return res
.status(200)
.json(
    new ApiResponse(200, paginatedComment, "Comment for a video fatched successfully")
)

})

const addComment = asyncHandler(async(req, res) => {
// add a comment to a video
const {content} = req.body
const {videoId} = req.params

if (!content?.trim()) {
    throw new ApiError(400, "Content is required")
}

if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided")
}

const newComment =  await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user?._id
})

if (!newComment) {
    throw new ApiError(500, "Something went wrong ")
}

return res
.status(200)
.json(new ApiResponse(200, newComment, "Comment successfully"))

})

const updateComment = asyncHandler(async( req, res ) => {
// update comment

const {commentId} = req.params;

const {content} = req.body;
 
if (!commentId || isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id")
}

if (!content?.trim()) {
    throw new ApiError(400,"content is required")
}

const updatedComment = await Comment.findByIdAndUpdate(
    commentId,{
        $set: {
            content : content.trim()
        }
    },{
        new: true

    }
)

if (!updatedComment) {
    throw new ApiError(500, "Something went wrong")
}

return res
.status(200)
.json(
     new ApiResponse(200, updatedComment, "Comment update successfuly")
)

})

const deleteComment = asyncHandler(async(req, res )=>{
    // delete Comment
const {commentId} = req.params

if (!commentId || isValidObjectId(commentId)) {
    throw new ApiError(400,"invalid Comment id" )
}

const comment = await Comment.findByIdDelete(comment)

return res
.status(200)
.json(new ApiError(200, comment, "Comment delete"))


})


export {getVideoComments,addComment,updateComment ,deleteComment};