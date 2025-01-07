import { Router } from "express";
// import { loggedOutUser, loginUser, registerUser, refreshAcessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controller/user.controller.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerUser,loginUser,getuserProfile } from "../controller/user.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
    registerUser
);
router.route("/login").post(loginUser)
// router.route("/logout").post(loginUser)
router.route("/profile/:id").get(verifyJWT,getuserProfile)
export default router;