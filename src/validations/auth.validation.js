// validation/auth.validation.js
import { z } from 'zod';
// UserRole va UserStatus enumlari uchun Zod schema
const UserRoleEnum = z.enum(['author', 'editor', 'admin']);
const UserStatusEnum = z.enum(['active', 'inactive']);
export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(), // Confirm password will be checked in controller
    role: UserRoleEnum.optional().default('author'), // Default role to 'author'
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
    bio: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});
export const verifyOtpSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});
export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
