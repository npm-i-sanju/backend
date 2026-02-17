import { Router } from "express";
import { veryfyJWT } from "../middlewares/auth.middleware.js";
import {getVideoComments,addComment,updateComment ,deleteComment} from "../controllers/comment.controller.js"

const router = Router()

//  Apply verifyJWT middleware to all routes in this file
router.use(veryfyJWT)

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/channel/commentId").delete(deleteComment).patch(updateComment)

export default router;