import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const chatHandlers = (socket, io) => {
  // Join a team's socket room (called after user opens a team)
  socket.on('team:join', async ({ teamId }, callback) => {
    try {
      // Verify membership
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: socket.user.id } },
      });

      if (!membership) {
        return callback?.({ ok: false, error: 'You are not a member of this team' });
      }

      socket.join(`team:${teamId}`);
      callback?.({ ok: true });
    } catch (err) {
      callback?.({ ok: false, error: 'Failed to join team room' });
    }
  });

  // Send a message to a team
  socket.on('chat:send', async ({ teamId, text }, callback) => {
    try {
      if (!text || !text.trim()) {
        return callback?.({ ok: false, error: 'Message cannot be empty' });
      }

      // Verify membership
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: socket.user.id } },
      });

      if (!membership) {
        return callback?.({ ok: false, error: 'You are not a member of this team' });
      }

      // Save message to DB
      const message = await prisma.message.create({
        data: {
          teamId,
          senderId: socket.user.id,
          text: text.trim(),
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      });

      // Broadcast to everyone in the team room
      io.to(`team:${teamId}`).emit('chat:new', message);

      // Update team's updatedAt to re-sort in sidebar
      await prisma.team.update({
        where: { id: teamId },
        data: { updatedAt: new Date() },
      });

      callback?.({ ok: true, message });
    } catch (err) {
      console.error('[chat:send error]', err);
      callback?.({ ok: false, error: 'Failed to send message' });
    }
  });

  // Leave a team's socket room
  socket.on('team:leave', ({ teamId }) => {
    socket.leave(`team:${teamId}`);
  });

  // Admin notifies a user of their request result
  socket.on('request:notify', ({ userId, teamName, action }) => {
    io.to(`user:${userId}`).emit('request:result', { teamName, action });
  });
};

export default chatHandlers;
