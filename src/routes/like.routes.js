import { Router } from "express";
import{veryfyJWT} from "../middlewares/auth.middleware.js"
import { videoLike, toggleCommentLike, toggleTweetLike, getLikedVideos} from "../controllers/like.controller.js"

const router = Router()

router.use(veryfyJWT);

router.route("/toggle/v/:videoId").post(videoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos)

export default router