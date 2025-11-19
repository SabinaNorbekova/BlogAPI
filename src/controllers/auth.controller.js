// controllers/auth.controller.js (YANGI VERSIYA)
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from '../validations/auth.validation.js';
import { AuthService } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import z from 'zod';
import { UserModel } from '../models/user.model.js';

export const AuthController = {
  async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const { userId } = await AuthService.register(data);

      return res.status(201).json({
        message: 'User registered. Check your email for OTP.',
        userId,
        otpSent: true,
      });
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS') {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      if (err.message === 'USERNAME_EXISTS') {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Validation error', errors: err.errors });
      }
      next(err);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      const { userId, otp } = verifyOtpSchema.parse(req.body);
      await AuthService.verifyOtp(userId, otp);

      return res
        .status(200)
        .json({ message: 'Account activated successfully' });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND')
        return res.status(404).json({ message: 'User not found' });
      if (err.message === 'INVALID_OTP')
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      if (err instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: 'Validation error', errors: err.errors });
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await AuthService.login(email, password);

      const { accessToken, refreshToken } = AuthService.generateTokens(user);
      await AuthService.saveRefreshToken(user.id, refreshToken);

      return res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
      });
    } catch (err) {
      if (err.message === 'INVALID_CREDENTIALS')
        return res.status(401).json({ message: 'Invalid credentials' });
      if (err.message === 'ACCOUNT_NOT_ACTIVATED')
        return res
          .status(403)
          .json({ message: 'Please verify your email first' });
      if (err instanceof z.ZodError)
        return res
          .status(400)
          .json({ message: 'Validation error', errors: err.errors });
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const { password, otp, otpExpiresAt, ...safeUser } = user;
      return res.json(safeUser);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      await UserModel.deleteUserRefreshTokens(req.user.id);
      return res.json({ message: 'Logout successful' });
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken: oldToken } = refreshTokenSchema.parse(req.body);

      const stored = await UserModel.findRefreshToken(oldToken);
      if (!stored)
        return res.status(403).json({ message: 'Invalid refresh token' });

      const decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN_SECRET);
      if (decoded.id !== stored.userId)
        return res.status(403).json({ message: 'Invalid token' });

      await UserModel.deleteRefreshToken(oldToken);

      const user = await UserModel.findById(decoded.id);
      const { accessToken, refreshToken: newToken } =
        AuthService.generateTokens(user);
      await AuthService.saveRefreshToken(user.id, newToken);

      return res.json({ accessToken, refreshToken: newToken });
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError)
        return res.status(403).json({ message: 'Invalid token' });
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: 'Validation error' });
      next(err);
    }
  },
};
