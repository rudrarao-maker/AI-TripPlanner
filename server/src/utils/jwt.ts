import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

export const verifyToken = (token: string, isRefresh = false) => {
  const secret = isRefresh 
    ? process.env.JWT_REFRESH_SECRET || 'refresh_secret' 
    : process.env.JWT_SECRET || 'secret';
  
  return jwt.verify(token, secret);
};
