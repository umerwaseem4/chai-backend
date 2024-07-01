import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        todo: {
            type: Schema.Types.ObjectId,
            ref: 'Todo',
            required: true,
        },
    },
    { timestamps: true }
);

export const Comments = mongoose.model('Comment', commentSchema);
