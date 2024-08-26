import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        //generate access token
        //generate refresh token
        //return access and refresh tokens
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation -not empty
    //check if user already exists: username, email
    //check for images, check for avatar
    //upload them to cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullname,email,username,password} = req.body
    // console.log("email:",email)
    // console.log("fullname:",fullname)
    // console.log("username:",username)
    // console.log("password:",password)
    // console.table(req.body)


    if (
        [fullname, email, username, password].some((field) => 
        field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or:[{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }



    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    

    let coverImageLocalPath = null;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // console.log(coverImageLocalPath)
    
   

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    
    // console.log(avatarLocalPath)
    const avatar = await uploadFileToCloudinary(avatarLocalPath)
    // console.log(avatar)

    const coverImage = coverImageLocalPath? await uploadFileToCloudinary(coverImageLocalPath):null;

    
    console.log(coverImage)
 
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) =>{
    //fetching the username and password from the database
    //check if it matches with any of the data in database
    //if it does, generate acces and refresh token and send it back to the client
    //send cookie
    //if it doesn't, throw an error
    const {username, email, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")    
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.generateAuthToken(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id)

    const options = {
        httpOnly: true,
        secure : false
    }

    res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200, {
        user: loggedInUser, accessToken,
        refreshToken
    }, "User logged in successfully"))

    // console.log(req.cookies)

    
})




const logOutUser = asyncHandler(async(req, res) => {
    
    const user = await User.findByIdAndUpdate(

        req.user._id,

        
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    // console.log(user)

    const options = {
        httpOnly: true,
        secure : false
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))


})


const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
         const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
         return res
         .status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("newRefreshToken",newRefreshToken,options)
         .json(
            new ApiResponse(200, 
                {accessToken,refreshToken:newRefreshToken}, 
                "Access token generated successfully")
         )
    } catch (error) {
        throw new Error(401,error?.message || "Invalid refresh token")
    }


})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body
    // console.log(oldPassword,newPassword)

    // if(!(oldPassword === confPassword)){
    //     throw new ApiError(401, "Passwords do not match")

    // }
    

    const user = User.findById(req.user?._id)

    // console.log(user)
    
    
    const isPasswordValid = await user.generateAuthToken(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials")

    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password changed successfully")
    )


})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json( new ApiResponse(200, req.user, "current User fetched successfully"))
})

const updataProfileFields = asyncHandler(async(req,res) => {
    // console.log(req.body)
    const {fullname, email} = req.body
    // console.log(fullname,email)
    

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {fullname, email}
        },
        {
            new: true
        }
    ).select("-password")

    

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Profile fields updated successfully")
    )
 
});

const updateUserAvatar = asyncHandler(async(req,res) => {
    // console.log(req.file.path)
    const avatarLocalPath = req.file.path
    // console.log(avatarLocalPath)
    

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadFileToCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {avatar: avatar.url}
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "User avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverLocalPath = req.file?.coverImage[0]?.path

    if(!coverLocalPath){
        throw new ApiError(400, "Cover Image file is required")
    }

    const coverImage = await uploadFileToCloudinary(coverLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {coverImage: coverImage.url}
        },
        {
            new: true
        }
    ).select("-password")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "User Cover Image updated successfully")
    )
})




export {
    registerUser, 
    loginUser, 
    logOutUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updataProfileFields,
    updateUserAvatar,
    updateUserCoverImage
};