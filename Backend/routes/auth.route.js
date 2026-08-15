import express from 'express';
import { registerUser, loginUser, getMe,logoutUser} from '../controllers/authController.js';

import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me',verifyToken,getMe);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser);

export default router;