// src/services/post.service.js
import { prisma } from '../prisma/prisma.js';

export const PostService = {
  async create(userId, data) {
    const { title, content, categoryId, tagIds, status } = data;

    return await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
        categoryId,
        status,
        publishedAt: status === 'published' ? new Date() : null,
        tags:
          tagIds.length > 0
            ? {
                create: tagIds.map((tagId) => ({ tagId })),
              }
            : undefined,
      },
      include: {
        author: { select: { firstName: true, lastName: true, avatar: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });
  },

  async getMyPosts(userId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { authorId: userId } }),
    ]);

    return { posts, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getPostById(postId,userId){
    const post=await prisma.post.findUnique({
      where:{id:postId},
      include:{
        author:{
          select:{
            id:true,
            username:true,
            firstName:true,
            lastName:true,
            avatar:true,
            bio:true
          }
        },
        category:true,
        tags:{
          include:{
            tag:true
          }
        }
      }
    });
    if(!post){
      throw {status:404, message:'Post topilmadi'}
    }

    if (post.status==='draft'&&post.authorId!==userId&&userId.role!=='ADMIN'){
      throw {status:403, message:'Bu post hali e`lon qilinmagan'}
    }
    return post
  },

  async update(postId, userId, data) {
    const { tagIds, ...rest } = data;

    const updateData = {
      ...rest,
      publishedAt: rest.status === 'published' ? new Date() : undefined,
    };

    if (tagIds !== undefined) {
      await prisma.postTag.deleteMany({ where: { postId } });
      if (tagIds.length > 0) {
        updateData.tags = {
          create: tagIds.map((tagId) => ({ tagId })),
        };
      }
    }

    return await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: { select: { firstName: true, lastName: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });
  },

  async delete(postId) {
    return await prisma.post.delete({ where: { id: postId } });
  },
};
