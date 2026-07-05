import { Router } from 'express';
import {
  createTeam,
  getMyTeams,
  requestToJoin,
  getPendingRequests,
  handleJoinRequest,
  getMessages,
} from '../controllers/team.controller.js';

const router = Router();

router.get('/my', getMyTeams);
router.post('/create', createTeam);
router.post('/join', requestToJoin);
router.get('/:teamId/requests', getPendingRequests);
router.post('/:teamId/requests/:requestId', handleJoinRequest);
router.get('/:teamId/messages', getMessages);

export default router;
