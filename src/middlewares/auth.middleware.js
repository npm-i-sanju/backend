import { asyncHandler } from "../utils/asyncHendler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
// step 1 :import necessary modules
//step 2: secret key to sing the jwt
//ster 3: simulated user "database"
//step 4: login route - returns jwt if cerdentials are valid
//step 5: validate user
//step 6: create token payload
//step 7: sign in and return token (expires in 1 hour)
//step 8: middleware to verify jwt
//step 9: get token from authorization header
//setp 10; verify token
//step 11: attach user info to request 
//step 12: protected route - requires valid jwt 
//step 13: start server

const veryfyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(new ApiError(401, "Unauthorized request"));
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return next(new ApiError(401, "Unauthorized request"));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(
            new ApiError(401, error?.message || "Invalid Token")
        );
    }
});



export { veryfyJWT };