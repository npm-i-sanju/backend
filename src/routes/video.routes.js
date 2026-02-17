import { Router } from "express";
import {veryfyJWT} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
import {getAllVideos,
    getAllUserVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus} from "../controllers/video.controller.js";


    const router = Router();

    router.use(veryfyJWT)

    router
    .route("/")
    .get(getAllVideos)
    .post(upload.fields([
        {name: "videoFile",
            maxCount: 1
        },{
            name: "thumbnail",
            maxCount: 1
        }
    ]),veryfyJWT,publishAVideo
)

router
.route("/:videoId")
.get(getVideoById)

router.route("/user/videos").get(getAllUserVideos);
router.route("/:videoId").delete(deleteVideo).patch(upload.single("thumbnail"),updateVideo);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;