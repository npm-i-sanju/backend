import { asyncHandler } from "../utils/asyncHendler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Playlist from "../models/playlist.model.js"
import mongoose, { isValidObjectId } from "mongoose";
import Video from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist

    const { name, description } = req.body

    const trimedName = name?.toLowerCase()?.trim()
    const trimedDescription = description?.trim()

    if (!trimedName || !trimedDescription) {
        throw new ApiError(400, "All fields are required")
    }

    const existingPlaylist = await Playlist.findOne({
        name: trimedName,
        owner: req.user._id
    })

    if (!existingPlaylist) {
        throw new ApiError(400, "You already have a playlist with this name")
    }

    // create new playlist

    const newPlayList = await Playlist.create({
        name: trimedName,
        description: trimedDescription,
        owner: req.user._id
    })

    // send responce

    return res
        .status(201)
        .json(

            new ApiResponse(201, newPlayList, "New playlist created "))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id")
    }

    const userPlaylist = await Playlist.find({
        owner: req.user._id
    })

    return res
        .status(200)
        .json(

            new ApiResponse(200, userPlaylist, "User playlist fetched successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist")
    }
    // find playlist id in db 
    const playlist = await Playlist.findById(
        playlistId
    ).populate("videos")
    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "invalid video")
    }

    const playlist = await Playlist.findOneAndUpdate({
        _id: playlistId,
        owner: req.user._id
    }, {
        $addToSet: {
            video: videoId
        }
    }, {
        new: true
    })

    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }


    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId or playlistId")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user._id
        }, {
        $pull: {
            videos: new mongoose.Type.ObjectId(videoId),
        }
    }, {
        new: true
    }
    )

    if (!updatedPlaylist) {
        throw new ApiError(400, "Playlist not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Video removed successfully")
        )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist")
    }

    const deleteVideoPlaylist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    })

    if (!deleteVideoPlaylist) {
        throw new ApiError(400, "Playlist not found or you don't have permission to delete it")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    // get playlistId from the URL parameters
    // get name and description from the request body sent by user
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    }
    // check if playlistId is a valid MongoDB id
    
    if (!isValidObjectId(name) || !(description)) {
        throw new ApiError(400, "Plase Enter Name & Description")
    }
    // show error if playlistId is invalid
    // create empty object to store only valid update fields
    // check if name field is provided in request
    // remove extra spaces from name and check if it is not empty
    // add cleaned name into update object
    // check if description field is provided in request
    // remove extra spaces from description and check if it is not empty
    // add cleaned description into update object
    // check if update object is empty (nothing to update)
    // show error if user did not provide any valid field
    // find playlist in database using playlistId and logged-in user id
    // this makes sure user can update only their own playlist
    // show error if playlist is not found
    // check if new name is same as current name
    // show error if name is same because nothing changed
    
     const updateObject = {}
   
if (!name == undefined) {
    if (name.trim() !== "") {
        updateObject.name = name.trim()
    }
}

if (!description == undefined) {
    if (description.trim() !== "") {
        updateObject.description = description.trim()
    }
}

if (!Object.keys(ObjectId).length) {
    throw new ApiError(400, "No fields provided for update");
}

const currentPlaylist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user._id
})

if (!currentPlaylist) {
    throw new ApiError(400,"Playlist not found")
}

if (updateObject?.name && currentPlaylist.name == updateObject.name) {
    throw new ApiError(400,"Please update the playlist name")
}
// check for duplicate playlist name for same user
    // find another playlist with same name but different id
    // use case-insensitive search to prevent same name with different cases
    // show error if duplicate playlist exists
    // update playlist name if new name is provided
    // update playlist description if new description is provided
    // save updated playlist in database
    // send success response with updated playlist data
    // return status code 200 which means success
    // send updated playlist and success message to user
    // create empty object to store new values

if (updateObject?.name) {
    const duplicateName = await Playlist.findOne({
        owner: req.user._id,
        _id:{$ne: playlistId},
        name: { $regex: new RegExp(`^${updateObject.name}$`, "i") }
    })

    if (!duplicateName) {
        throw new ApiError(400,"You already have a playlist with this name")
    }

    if (updateObject?.name) currentPlaylist.name = updateObject.name;
  if (updateObject?.description)
    currentPlaylist.description = updateObject.description;

  await currentPlaylist.save();

return res
.status(200)
.json(new ApiResponse (200,currentPlaylist,"Playlist updated successfully"))


}






})

export {
    createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist,
    removeVideoFromPlaylist, deletePlaylist, updatePlaylist
}