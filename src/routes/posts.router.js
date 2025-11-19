// src/routers/post.router.js
import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPostOwnership } from '../middleware/ownership.middleware.js';

const router = Router();

router.use(protect);

router.post('/', PostController.create);
router.get('/my', PostController.getMyPosts);
router.get('/:id', PostController.getById);
router.put('/:id', checkPostOwnership, PostController.update);
router.delete('/:id', checkPostOwnership, PostController.delete);

export { router as postRouter };
