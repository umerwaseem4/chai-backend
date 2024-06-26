// require('dotenv').config()
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './.env',
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log('Mongodb db connection failed!!!', err);
    });

// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error", (error) => {
//             console.log("Error", error);
//             throw error;
//         });

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on Port: ${process.env.PORT}`);
//         });
//     } catch (error) {
//         console.log("Error: ", error);
//         throw error;
//     }
// })();
