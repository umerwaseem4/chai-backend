import { Router } from 'express';
import { loginUser, logoutUSer, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1,
        },
        {
            name: 'coverImg',
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route('/login').post(loginUser)

// secure routes
router.route('/logout').post(verifyJWT, logoutUSer)

export default router;
