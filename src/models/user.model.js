// models/user.model.js
import { prisma } from '../prisma/prisma.js';

export const UserModel = {
  async create(data) {
    return prisma.user.create({ data });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findByUsername(username) {
    return prisma.user.findUnique({ where: { username } });
  },

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  async saveRefreshToken(userId, token, expiresAt) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  async deleteRefreshToken(token) {
    return prisma.refreshToken.delete({ where: { token } });
  },

  async deleteUserRefreshTokens(userId) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  },
};
