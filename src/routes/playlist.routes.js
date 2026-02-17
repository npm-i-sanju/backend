import { Router } from "express";
import {createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist,
    removeVideoFromPlaylist, deletePlaylist, updatePlaylist} from "../controllers/playList.controller.js";

import {veryfyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(veryfyJWT);

router.route("/").post(createPlaylist);
router.route("/: playlistId")
.get(getPlaylistById)
.patch(updatePlaylist)
.delete(deletePlaylist)

router.route("/add//add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router