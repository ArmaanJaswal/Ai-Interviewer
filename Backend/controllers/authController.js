import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function hashPassword(plainTextPassword) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function setTokenCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, adjust to match JWT_EXPIRES_IN
  });
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.status(400).json({ message: "Please Enter All the Details" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = generateToken(newUser._id);
    setTokenCookie(res, token);

    return res.status(201).json({
      message: "User successfully registered",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        plan: newUser.plan,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please Enter all details" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Incorrect Details" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Details" });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMe = async (req, res) => {
     return res.status(200).json({ user: req.user });
   };


const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=google_auth_failed`);
    }

    const token = generateToken(req.user._id);
    setTokenCookie(res, token);

    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_error`);
  }
};

const githubCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=github_auth_failed`);
    }

    const token = generateToken(req.user._id);
    setTokenCookie(res, token);

    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`);
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_error`);
  }
};

export { registerUser, loginUser, getMe, logoutUser, googleCallback, githubCallback };