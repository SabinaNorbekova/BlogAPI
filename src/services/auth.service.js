// src/services/auth.service.js
import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/emailSender.js';

export const AuthService = {
  async register(data) {
    const {
      email,
      username,
      password,
      role = 'author',
      firstName,
      lastName,
      avatar,
      bio,
    } = data;

    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) throw new Error('EMAIL_EXISTS');

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) throw new Error('USERNAME_EXISTS');

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

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
      to: email,
      subject: 'Verify Your Account - BlogAPI OTP',
      text: `Your OTP is: ${otp}. Valid for 10 minutes.`,
      html: `<p>Your OTP is: <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
    });

    return { userId: newUser.id };
  },

  async verifyOtp(userId, otp) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpiresAt) {
      throw new Error('INVALID_OTP');
    }

    await UserModel.update(userId, {
      status: 'active',
      otp: null,
      otpExpiresAt: null,
    });

    return true;
  },

  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('INVALID_CREDENTIALS');

    if (user.status === 'inactive') {
      throw new Error('ACCOUNT_NOT_ACTIVATED');
    }

    return user;
  },

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m' },
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d' },
    );

    return { accessToken, refreshToken };
  },

  async saveRefreshToken(userId, refreshToken) {
    const expiresAt = new Date(
      Date.now() + (parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS) || 604800000),
    );
    await UserModel.saveRefreshToken(userId, refreshToken, expiresAt);
  },
};
