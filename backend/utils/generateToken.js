const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true, // required for cross-site cookies (Render + Vercel)
    sameSite: 'None', // allow cross-site cookie so frontend can send it
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
  });
};

module.exports = generateToken;