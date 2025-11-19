// src/middleware/ownership.middleware.js
import { prisma } from '../prisma/prisma.js';

export const checkPostOwnership = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.authorId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isEditor = req.user.role === 'EDITOR';

    if (!isOwner && !isAdmin && !isEditor) {
      return res
        .status(403)
        .json({ message: 'You can only edit your own posts' });
    }

    req.post = post;
    next();
  } catch (err) {
    next(err);
  }
};
