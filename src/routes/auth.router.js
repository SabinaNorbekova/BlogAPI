// routers/auth.router.js
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
const router = Router();
router.post('/signup', AuthController.register);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/signin', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', protect, AuthController.getMe);
router.get('/logout', protect, AuthController.logout);
// Faqat adminlar foydalana oladigan end-point
// router.get("/admin-only", protect, authorize(["admin"]), (req, res) => {
//   res.status(200).json({ message: "Welcome, Admin!" });
// });
export { router as authRouter };
