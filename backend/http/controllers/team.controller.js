import * as teamService from '../services/team.service.js';
import { createTeamSchema, joinTeamSchema, requestActionSchema } from '../schemas/team.schema.js';

export const createTeam = async (req, res) => {
  const parsed = createTeamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const team = await teamService.createTeam({ ...parsed.data, adminId: req.user.id });
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMyTeams = async (req, res) => {
  try {
    const teams = await teamService.getMyTeams(req.user.id);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const requestToJoin = async (req, res) => {
  const parsed = joinTeamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const request = await teamService.requestToJoin({ groupId: parsed.data.groupId, userId: req.user.id });
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await teamService.getPendingRequests({
      teamId: req.params.teamId,
      adminId: req.user.id,
    });
    res.json(requests);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

export const handleJoinRequest = async (req, res) => {
  const parsed = requestActionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const result = await teamService.handleJoinRequest({
      teamId: req.params.teamId,
      requestId: req.params.requestId,
      adminId: req.user.id,
      action: parsed.data.action,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await teamService.getMessages({
      teamId: req.params.teamId,
      userId: req.user.id,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      cursor: req.query.cursor,
    });
    res.json(messages);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};
