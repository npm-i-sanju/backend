import { asyncHandler } from "../utils/asyncHendler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/uplod.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }

}

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic goes here
    //get user details from frontend
    //validate user details
    //check if user already exists
    //check for image
    //check for avatar
    // upload image to cloudinary
    // create user object in db
    // remove password and refresh token from response
    // check for user creation success
    // respond returning user details

    const { fullname, email, username, password } = req.body;
    console.log("email:", email);
    console.log("username:", username);
    console.log("fullname:", fullname);
    // console.log("password:", password);
    console.log("req.body:", req.body);

    if (fullname === "") {
        throw new ApiError(400, "Fullname is required");
    }
    if (email === "") {
        throw new ApiError(400, "Email is required");
    }
    if (username === "") {
        throw new ApiError(400, "Username is required");
    }
    if (password === "") {
        throw new ApiError(400, "Password is required");
    }
    // Alternative approach advanced
    // if([fullname,email,username,password].some(
    //     (field) => field?.trim() ===""
    // )){
    //     throw new ApiError(400, "All fields are required");
    // }

    const existedUser = await User.findOne({ // to check user already exists
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }
    console.log("req.files:", req.files);
    console.log("req.files.avatar:", req.files?.avatar);

    //const avatarLocalPath = req.files?.avater[0]?.path;    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log("avatarLocalPath:", avatarLocalPath);

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    //console.log("coverImageLocalPath:", coverImageLocalPath);
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    console.log("coverImageLocalPath:", coverImageLocalPath);


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    console.log("avatar:", avatar);

    const coverImage = await uploadToCloudinary(coverImageLocalPath);
    console.log("coverImage:", coverImage);

    if (!avatar) {
        throw new ApiError(400, "Avatar  dedo bhai image is required");

    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,// try this avatar : avatar?.url
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong user creation failed");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );

})

const loginUser = asyncHandler(async (req, res) => {
    // Login logic goes here
    //get user details from frontend
    // find the user
    // password comparison 
    // access and refresh token generation
    // send cookies

    const { email, password, username } = req.body;
    console.log("email:", email);

    // if (email === "") {
    //     throw new ApiError(400, "Email is required");
    // }

    // if (password ==="") {
    //     throw new ApiError(400, "Password is required");
    // }

    if (!(email || password)) {
        throw new ApiError(400, "Email and Password are required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User dosen't exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const logedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(200, {
                user: logedInUser,
                refreshToken
            }, "User logged in successfully")
        )




})

const logedOutUser = asyncHandler(async (req, res) => {


    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1// remove the document from field
        }
    }, {
        new: true
    })
    const cookieOptions = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("refreshToken", cookieOptions)
        .clearCookie("accessToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"))


})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refresjToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }
    // verify jwt token

    try {
        const decodedtoken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)


        const user = await User.findById(decodedtoken?._id)

        if (!user) {
            throw new ApiError("Invalid Refresh Token");

        }
        // check user token and decoded token

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError("Invalid Refresh Token")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newrefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200, {
                    accessToken, refreshToken: newrefreshToken
                },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")

    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPasssword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPasssword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "invalid Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Change successfuly"))
})

const getCurrentUser = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(200, req.user, "Current user fatched successfully")

})

const updateUserDetails = asyncHandler(async (req, res) => {

    const { fullname, email } = req.body

    if (!(fullname && email)) {
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullname,
            email
        }
    }, { new: true }).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Account details updated"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploding Avatar file is missing")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    }, {
        new: true
    }).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200, user, "AvaterImage is Updated"
        ))

})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage Is Messing")
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Cover Image not Upload on Cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, {
        new: true
    }).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200, user, "CoverImage is Updated"
        ))

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
    //write pipeline
    const channel = await User.aggregate([{
        $match: {
            username: username?.toLowerCase()
        }
    }, {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    }, {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    }, {
        $addFields: {
            subscribersCount: {
                $size: "$subscribers"
            },
            channelSubscribedTocount: {
                $size: "$subscribedTo"
            },
            isSubscribed: {
                $cond: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false
                }
            }
        }
    }, {
        $project: {
            fullname: 1,
            username: 1,
            subscribersCount: 1,
            channelSubscribedTocount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1
        }
    }])

    if (!channel?.length) {
        throw new ApiError(404,"channel dose not exists")
    }
return res
.status(200)
.json(new ApiResponse(200,"user channel fatched succesfully"))


})

const getWatchHistory = asyncHandler(async(req,res)=>{
const user = await User.aggregate([
    {
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },{
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"user",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },{
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    }
])
return res
.status(200)
.json(new ApiResponse(200,user[0].watchHistory,"Watch History Fatch Successfully"))

})


export {
    registerUser,
    loginUser,
    logedOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
};