import { ApiError } from '../utils/ApiError.js';
import { Comments } from '../models/comment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const createComment = asyncHandler(async (req, res) => {
    const { title } = req.body;
    const userid = req.user._id;
    const { todoId } = req.params;

    if (!title && !todoId) {
        throw new ApiError(400, 'Todo id or title is missing');
    }

    const createdCommment = await Comments.create({
        title,
        user: userid,
        todo: todoId,
    });

    if (!createdCommment) {
        throw new ApiError(500, 'Something went wrong!');
    }

    const responseComment = await Comments.findById(createdCommment._id).select(
        '-user -todo'
    );

    if (!responseComment) {
        throw new ApiError(400, 'Comment not found!');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, responseComment, 'comment created!'));
});

export const getCommentsOnTodo = asyncHandler(async (req, res) => {
    const { todoId } = req.params;

    if (!todoId) {
        throw new ApiError(400, 'Todo id is required!');
    }

    const todoComments = await Comments.find({ todo: todoId })
        .select('-todo')
        .populate('user', 'username avatar');

    if (!todoComments) {
        throw new ApiError(400, 'cannot find comments on todo!');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, todoComments, 'All comments on todo fetched!'));
});
