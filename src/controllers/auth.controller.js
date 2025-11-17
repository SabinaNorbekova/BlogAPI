// controllers/auth.controller.js
import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from '../validations/auth.validation.js';
import { z } from 'zod';
import crypto from 'crypto';
import sendEmail from '../utils/emailSender.js';

export const AuthController = {
  async register(req, res, next) {
    try {
      const {
        email,
        username,
        password,
        confirmPassword,
        role,
        firstName,
        lastName,
        avatar,
        bio,
      } = registerSchema.parse(req.body);

      const existingUserByEmail = await UserModel.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          message: 'Email already exists. Please use a different email.',
        });
      }
      const existingUserByUsername = await UserModel.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({
          message:
            'Username already exists. Please choose a different username.',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const newUser = await UserModel.create({
        email,
        username,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        avatar,
        bio,
        otp,
        otpExpiresAt,
        status: 'inactive',
      });

      await sendEmail({
        to: newUser.email,
        subject: 'Verify Your Account - BlogAPI OTP',
        text: `Your OTP for BlogAPI is: ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP for BlogAPI is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
      });

      return res.status(201).json({
        message:
          'User registered successfully. Please check your email for OTP verification.',
        userId: newUser.id,
        otpSent: true,
      });
    } catch (err) {
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

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.otp || user.otp !== otp || new Date() > user.otpExpiresAt) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      await UserModel.update(userId, {
        status: 'active',
        otp: null,
        otpExpiresAt: null,
      });

      return res
        .status(200)
        .json({ message: 'OTP verified, account activated successfully' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Validation error', errors: err.errors });
      }
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({
          message:
            'Account is not activated. Please verify your email with OTP.',
        });
      }

      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
        },
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
        },
      );

      const refreshTokenExpiresAt = new Date(
        Date.now() +
          (parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS) || 604800000),
      );
      await UserModel.saveRefreshToken(
        user.id,
        refreshToken,
        refreshTokenExpiresAt,
      );

      return res.status(200).json({
        message: 'Login successful',
        accessToken,
        refreshToken,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Validation error', errors: err.errors });
      }
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, otp, otpExpiresAt, ...userWithoutSensitiveData } = user;

      return res.status(200).json(userWithoutSensitiveData);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      await UserModel.deleteUserRefreshTokens(req.user.id);

      return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken: oldRefreshToken } = refreshTokenSchema.parse(
        req.body,
      );

      const storedRefreshToken =
        await UserModel.findRefreshToken(oldRefreshToken);
      if (!storedRefreshToken) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const decoded = jwt.verify(
        oldRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      if (!decoded || decoded.id !== storedRefreshToken.userId) {
        await UserModel.deleteRefreshToken(oldRefreshToken);
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      await UserModel.deleteRefreshToken(oldRefreshToken);

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
        },
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
        },
      );

      const refreshTokenExpiresAt = new Date(
        Date.now() +
          (parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS) || 604800000),
      );
      await UserModel.saveRefreshToken(
        user.id,
        newRefreshToken,
        refreshTokenExpiresAt,
      );

      return res.status(200).json({
        message: 'Tokens refreshed successfully',
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Validation error', errors: err.errors });
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
      next(err);
    }
  },
};
