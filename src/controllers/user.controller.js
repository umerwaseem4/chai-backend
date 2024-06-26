import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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
    const coverImageLocalPath = req.files?.coverImg[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required!');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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

export { registerUser };
