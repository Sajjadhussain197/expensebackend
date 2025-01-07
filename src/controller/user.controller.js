import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessTokenRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        console.log(user)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
         console.log(accessToken,refreshToken)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }




    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")

    }
}


const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullName, password,role } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "Email or username is requried")
    }
    if (!fullName || !password || !role) {
        throw new ApiError(400, "all fields are requried ")
    }


    const existinguser = await User.findOne({ $or: [{ username }, { email }] });
    if (existinguser) {
        throw new ApiError(409, "User with this email or username already exists")
    }
    const registeruser = await User.create({
        username,
        email,
        fullName,
        password,
        role
    })

    const createdUser = await User.findById(registeruser._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    res.status(201).json(
        new ApiResponse(200, registeruser, "User created Successfully!!!!")
    )




})
const loginUser = asyncHandler(async (req, res) => {
    try {
        const { username, email, password } = req.body
        if (!username && !email) {
            throw new ApiError(400, "Username or Email is required")
        }
        const user = await User.findOne({username })
        console.log(user)
        if (!user) {
            throw new ApiError(404, "User doesnt exist")

        }
        const ispasswordValid = await user.isPasswordCorrect(password)
        if (!ispasswordValid) {
            throw new ApiError(401, "the password is incorrect")

        }
        console.log(ispasswordValid)

        const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"

        )

        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser, accessToken, refreshToken },
                    "User logged In Successfully"
                )
            )


    } catch (error) {
        throw new ApiError(500, "User login failed")

    }

})
const loggedOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
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
    const options = {
        httpOnly: true,
        secure: true
    }
    console.log(req.user._id)
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out")
        )


})

const getuserProfile=asyncHandler(async (req,res)=>{
    const { id} =req.params
    const user=await User.findById(id).select("-password")
    if(!user){
        new ApiError(400,"user not found")
    }
    res.status(200).json(new ApiResponse(200, user,"Profile retrived successfully "))
})
export {
    registerUser,
    loginUser,
    getuserProfile


}