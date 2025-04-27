import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadImage} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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

export {registerUser}