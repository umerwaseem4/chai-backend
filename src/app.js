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

export { app };
