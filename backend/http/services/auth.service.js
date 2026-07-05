import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../../env.js';

const prisma = new PrismaClient();

export const signup = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true },
  });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return { user, token };
};

export const signin = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
};
