import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser, () => {
    console.log("User registered successfully")
})




export default router;