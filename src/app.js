import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// express middlewares
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: `${process.env.LIMIT}kb` }));
app.use(
    express.urlencoded({
        extended: true,
        limit: `${process.env.LIMIT}kb`,
    })
);
app.use(express.static('public'));
app.use(cookieParser());

// custom routes
import userRoute from './routes/user.routes.js';
import todoRoute from './routes/todo.routes.js';
import commentRoute from './routes/comment.route.js';

app.use('/api/v1/users', userRoute);
app.use('/api/v1/todo', todoRoute);
app.use('/api/v1/comment', commentRoute);

export { app };
