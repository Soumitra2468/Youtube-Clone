import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
 
export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError("Access token is required", 401);
    }
    //verify the token
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded?.id).select("-password -refreshToken -__v -createdAt -updatedAt")
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        req.user = user;
        next();
    }catch (error) {
        throw new ApiError("Invalid access token", 401);
    }          
})