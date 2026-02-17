import {asyncHandler} from "../utils/asyncHendler.js";
import {ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import {Subscription} from "../models/subscription.model.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
// validate channelId
// find channel id in database

if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id")
}

const channelOwner =  await User.findById(channelId)

if (!channelOwner) {
    throw new ApiError(400, "User not found")
}

if (channelId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself")
}

const subscriptionRrecord =  await Subscription.findOne({
channel : channelId,
subscriber: req.user._id
})

if (subscriptionRrecord){
    // already subscribed , so unsubscribe
    await subscriptionRrecord.findOneAndDelete(
        {
        channel : channelId,
        subscriber: req.user._id
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Unsubscribed successfully"))
}

// not subscribed , so subscribe
const newSubscribe = await Subscription.create({
    channel: channelId,
    subscriber: req.user._id
}).select("-__v -createdAt -updatedAt")

return res
.status(200)
.json(new ApiResponse(200,newSubscribe,"Subscribed successfully"))





})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
// validate channelId
// find channel id in database

if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id")
}


const { subscriberId } = req.params;

  if (!subscriberId || !isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriberId");
  }

  const existingUser = await User.findById(subscriberId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const subscribers = await Subscription.find({
    channel: subscriberId,
  }).populate({
    path: "subscriber",
    select: "-refreshToken -password",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscriber list fetched successfully")
    );

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const existingUser = await User.findById(channelId);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const channelSubscribed = await Subscription.find({
    subscriber: channelId,
  }).populate({
    path: "channel",
    select: "-refreshToken -password",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelSubscribed,
        "Channel subscribed list fetched successfully"
      )
    );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}