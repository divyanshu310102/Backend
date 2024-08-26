import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async(req,res,next) => {
    //validate jwt token
    //check if token is valid
    //if valid, attach user to req.user
    //else throw error
    try {
        // console.log(req.cookies)
        // console.log("Entered in verifyJWT")
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        // console.log("token:",token)
        if(!token) {
            throw new Error(401,"Not authorized, token required")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401, "Unauthorized, invalid token")
        }
    
        req.user = user;

        // console.log(req.user)
        next()
    } catch (error) {
        // console.log("Entered in catch")
        throw new ApiError(401, error?.message || "Invalid Access Token")
        
    }




})