import { Router } from "express";
import {
    loginUser, registerUser, logedOutUser,
    refreshAccessToken, changeCurrentPassword,
    getCurrentUser, updateUserDetails, updateUserAvatar,
     getUserChannelProfile, getWatchHistory,
    updateCoverImage
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { veryfyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",// fist field name form frontend
            maxCount: 1
        }, {
            name: "coverImage",// second field name form frontend
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secure routes

router.route("/logout").post(veryfyJWT, logedOutUser);

router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(veryfyJWT, changeCurrentPassword);
router.route("/curent-user").get(veryfyJWT, getCurrentUser);
router.route("/update-account").patch(veryfyJWT, updateUserDetails);
router.route("/avater").patch(veryfyJWT, upload.single("avater"), updateUserAvatar);
router.route("/coverImage").patch(veryfyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/channel/:username").get(veryfyJWT, getUserChannelProfile);
router.route("/watch-history").get(veryfyJWT, getWatchHistory)



export default router;