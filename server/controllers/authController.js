const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, dob } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name, email, password, dob,
      role: role || 'freelancer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase().replace(/\s/g, '')}`,
    });

    const token = generateToken(user._id);
    res.cookie('microgig_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, skills: user.skills },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.cookie('microgig_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, skills: user.skills, rating: user.rating, completedGigs: user.completedGigs, totalEarnings: user.totalEarnings },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.microgig_token) {
      token = req.cookies.microgig_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(200).json(null);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(200).json(null);
    res.status(200).json(user);
  } catch (err) { res.status(200).json(null); }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
exports.googleLogin = async (req, res, next) => {
  try {
    const { token, role } = req.body;
    
    // Fetch user details from Google using the access token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const payload = await googleRes.json();
    
    if (!googleRes.ok) {
      return res.status(401).json({ message: 'Invalid Google Token' });
    }

    const { sub: googleId, email, name, picture: avatar } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have googleId, link it
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        role: role || 'freelancer'
      });
    }

    const jwtToken = generateToken(user._id);
    res.cookie('microgig_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      token: jwtToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, skills: user.skills, rating: user.rating, completedGigs: user.completedGigs, totalEarnings: user.totalEarnings },
    });

  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ message: 'Google Authentication failed' });
  }
};
// GET /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    res.cookie('microgig_token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'User logged out successfully' });
  } catch (err) { next(err); }
};
