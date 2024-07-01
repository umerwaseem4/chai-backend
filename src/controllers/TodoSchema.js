import { Todo } from '../models/todo.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createTodo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title && !description) {
        throw new ApiError(400, 'All fields are required!');
    }

    const userID = req.user._id;

    const createdTodo = await Todo.create({
        title,
        description,
        user: userID,
    });

    if (!createdTodo) {
        throw new ApiError(500, 'Something went wrong!');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdTodo, 'Todo Created!'));
});

// get all todos of a user
export const getTodos = asyncHandler(async (req, res) => {
    const userID = req.user._id;

    const todos = await Todo.find({ user: userID }).select('-user');

    if (!todos) {
        throw new ApiError(404, 'No todos found!');
    }

    return res.status(200).json(new ApiResponse(200, todos, 'Todos Found!'));
});

// get all the todos of all users with user detail
export const getAllTodos = asyncHandler(async (req, res) => {
    const todos = await Todo.find().populate('user', 'username email avatar');

    if (!todos) {
        throw new ApiError(404, 'No todos found!');
    }

    return res.status(200).json(new ApiResponse(200, todos, 'Todos Found!'));
});
