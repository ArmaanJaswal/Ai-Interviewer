import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, getMe, logoutUser, googleCallback, githubCallback } from '../controllers/authController.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', verifyToken, getMe);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Google OAuth routes via Passport.js
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed`,
    session: false,
  }),
  googleCallback
);

// GitHub OAuth routes via Passport.js
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_failed`,
    session: false,
  }),
  githubCallback
);

export default router;