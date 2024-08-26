import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logOutUser, refreshAccessToken, registerUser, updataProfileFields, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/get-user").get(verifyJWT,getCurrentUser)
router.route("/update-profile").patch(verifyJWT,updataProfileFields)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
router.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)




export default router;