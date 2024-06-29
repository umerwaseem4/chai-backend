import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

// methods to generate tokens

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken(); // generating access token
        const refreshToken = user.generateRefreshToken(); // generating refresh token
        user.refreshToken = refreshToken; // updating user object
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            'Something went wrong while generating tokens!'
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    // validation of incoming data
    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ''
        )
    ) {
        throw new ApiError(400, 'All fields are required');
    }

    // checking for already saved user in db
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(
            409,
            'User with this username or email already exists!'
        );
    }

    // uploading images to cloudinary
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImg[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImg) &&
        req.files.coverImg.length > 0
    ) {
        coverImageLocalPath = req.files.coverImg[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required!');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // check if got the avatar or not!
    if (!avatar) {
        throw new ApiError(400, 'Avatar file is required!');
    }

    // creating user
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImg: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase(),
    });

    const justCreatedUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if (!justCreatedUser) {
        throw new ApiError(500, 'Something went wrong while registering user!');
    }

    // creating new response
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                justCreatedUser,
                'User registered successfully!'
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, 'username or email is required!');
    }

    const findingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!findingUser) {
        throw new ApiError(404, 'User doesnot exist!');
    }

    const isPasswordValid = await findingUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user credentials!');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        findingUser._id
    );

    const loggedInUser = await User.findById(findingUser._id).select(
        '-password -refreshToken'
    );

    // sending these tokens in cookies

    const options = {
        httponly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                'user loggedin successfully!'
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    // sending these tokens in cookies

    const options = {
        httponly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User loggedout successfully!'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'unauthorized request');
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, 'invalid refresh token');
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used!');
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken,
                    refreshToken: newRefreshToken,
                }),
                'access token refreshed sucessfully!'
            );
    } catch (error) {
        throw new ApiError(401, error?.message || 'invalid refresh token');
    }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
