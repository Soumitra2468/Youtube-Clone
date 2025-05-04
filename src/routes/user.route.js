import { Router } from "express";
import {loginUser,registerUser,logoutUser,refreshAccessToken, changePassword, getCurrentUser,updateUserProfile,updateUserAvatarAndCoverImage,getUserChannelProfile,getWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changePassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("update-profile").patch(verifyJWT, updateUserProfile)

router.route("/update-avtar-cover").patch(
    verifyJWT,
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    updateUserAvatarAndCoverImage
)

router.route("/channel-profile/:username").get(verifyJWT, getUserChannelProfile)

router.route("/watch-history").get(verifyJWT, getWatchHistory)



export default router;
// import { upload } from "../middlewares/multer.middleware.js";