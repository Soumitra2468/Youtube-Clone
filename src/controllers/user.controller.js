import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadImage} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

//register user
const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    const {fullname, username, email, password } = req.body;
    //check if user already exists in the database
    if(
        [fullname, username, email, password].some((field)=>
        field?.trim() === "")
       ){
        throw new ApiError("All fields are required", 400);
    } 
    //check if user already exists in the database
    const userExists = await User.findOne({$or: [{username}, {email}]});
    if(userExists){
        throw new ApiError("User with username and email allready exists", 409);
    }
    //avatar and cover image are required
    const avatarLocalPath =  req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }   
    if(!avatarLocalPath ){
        throw new ApiError("Avatar image is required", 400);
    } 
    //upload avatar image to cloudinary
    const avatar = await uploadImage(avatarLocalPath);
    //upload cover image to cloudinary
     const coverImage = await uploadImage(coverImageLocalPath);
    //check if avatar image is uploaded successfully
    if(!avatar){
        throw new ApiError("Error, uploading avatar images", 500);
    }
    //create user in the database
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });
    //cheack if user is created successfully
    const createdUser = await User.findById(user._id).select("-password -refreshToken -__v -createdAt -updatedAt");
    if(!createdUser){
        throw new ApiError("Error, creating user", 500);
    }
    //send response to the frontend
    res.status(201).json(
        new ApiResponse(
            201, 
            "User created successfully", 
            createdUser
        ));   
})
//generate access token and refresh token for the user
const genAccAndRefToken = async (userId) => {
    // generate access token and refresh token for the user
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // save refresh token to the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error); // For debugging
        throw new ApiError("Error generating tokens", 500);
    }
};
//login user
const loginUser = asyncHandler(async (req, res) => {
     //get user details from body
     const {username,email, password} = req.body;
    //check if user details are provided
    if (!(username || email)) {
        throw new ApiError("Username or email is required", 400);
    }
    //check if user exists in the database
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if (!user) {
        throw new ApiError("Invalid username or email", 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid password", 401);
    }
    //generate access token and refresh token for the user
    const { accessToken, refreshToken } = await genAccAndRefToken(user._id);

    const userData = await User.findById(user._id).select("-password -refreshToken ");
    if (!userData) {
        throw new ApiError("Error, fetching user data", 500);
    }
    //send response to the frontend
    const options ={
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                "User logged in successfully", 
                {user: userData,refreshToken, accessToken}
            ));
})
//logout user
const logoutUser = asyncHandler(async (req, res) => {
    //get user id from the request
    User.findByIdAndUpdate(
        req.user._id,
        {$unset: {
            refreshToken: 1
          }
        },
        {new: true}
    )

    const options ={
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200, 
                "User logged out successfully", 
                {}
            ));
})
//refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    //get refresh token from the request
    const getRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.query.refreshToken;
    if (!getRefreshToken) {
        throw new ApiError("Unauthorized request!", 401);
    }
    //find user by refresh token
    try {
        const decoded = jwt.verify(getRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decoded?.id).select("-password -createdAt -updatedAt");
        if (!user) {
            throw new ApiError("invalid refresh token", 401);
        }
        //compare refresh token with the one in the database
        if (user.refreshToken !== genAccAndRefToken) {
            throw new ApiError("refresh token is expired", 401);
        }
        //generate new access token and refresh token for the user
        const options = {
            httpOnly: true,
            secure: true,
        };
        const {accessToken, refreshToken} = await genAccAndRefToken(user._id) 
            //send response to the frontend
            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200, 
                        "Access token refreshed successfully", 
                        {accessToken, refreshToken}
                    ));
    } catch (error) {
        console.error(error); // For debugging
        throw new ApiError("Invalid refresh token", 401);
        
    }
})           
export {registerUser, loginUser,logoutUser, refreshAccessToken};