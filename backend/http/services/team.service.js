import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate a unique 8-character group ID
const generateGroupId = () => crypto.randomBytes(4).toString('hex').toUpperCase();

const ensureUniqueGroupId = async () => {
  let groupId;
  let exists = true;
  while (exists) {
    groupId = generateGroupId();
    const team = await prisma.team.findUnique({ where: { groupId } });
    exists = !!team;
  }
  return groupId;
};

// Create a new team — creator becomes admin and first member
export const createTeam = async ({ name, description, adminId }) => {
  const groupId = await ensureUniqueGroupId();

  const team = await prisma.team.create({
    data: {
      name,
      description,
      groupId,
      adminId,
      members: {
        create: { userId: adminId },
      },
    },
    include: {
      admin: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true } },
    },
  });

  return team;
};

// Get all teams a user is a member of
export const getMyTeams = async (userId) => {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          admin: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { team: { updatedAt: 'desc' } },
  });

  return memberships.map((m) => m.team);
};

// Send a join request using groupId
export const requestToJoin = async ({ groupId, userId }) => {
  const team = await prisma.team.findUnique({ where: { groupId } });
  if (!team) throw new Error('Team not found with that Group ID');

  // Check if already a member
  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: team.id, userId } },
  });
  if (existing) throw new Error('You are already a member of this team');

  // Check if admin — shouldn't happen but guard anyway
  if (team.adminId === userId) throw new Error('You are the admin of this team');

  // Upsert join request (in case previously rejected, allow re-request)
  const request = await prisma.joinRequest.upsert({
    where: { teamId_userId: { teamId: team.id, userId } },
    update: { status: 'PENDING' },
    create: { teamId: team.id, userId, status: 'PENDING' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true, groupId: true } },
    },
  });

  return request;
};

// Get all pending join requests for a team (admin only)
export const getPendingRequests = async ({ teamId, adminId }) => {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new Error('Team not found');
  if (team.adminId !== adminId) throw new Error('Only the team admin can view requests');

  const requests = await prisma.joinRequest.findMany({
    where: { teamId, status: 'PENDING' },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return requests;
};

// Admin accepts or rejects a join request
export const handleJoinRequest = async ({ teamId, requestId, adminId, action }) => {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new Error('Team not found');
  if (team.adminId !== adminId) throw new Error('Only the team admin can handle requests');

  const request = await prisma.joinRequest.findUnique({ where: { id: requestId } });
  if (!request || request.teamId !== teamId) throw new Error('Request not found');
  if (request.status !== 'PENDING') throw new Error('Request already handled');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.joinRequest.update({
      where: { id: requestId },
      data: { status: action },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });

    if (action === 'ACCEPTED') {
      await tx.teamMember.create({
        data: { teamId, userId: request.userId },
      });
    }

    return updatedRequest;
  });

  return updated;
};

// Fetch message history for a team
export const getMessages = async ({ teamId, userId, limit = 50, cursor }) => {
  // Ensure user is a member
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (!membership) throw new Error('You are not a member of this team');

  const messages = await prisma.message.findMany({
    where: { teamId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  return messages;
};
