import * as teamService from '../services/team.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function removeMember(req, res) {
  sendSuccess(res, await teamService.removeTeamMember(req.params.id, req.validated.params.memberId, req.user));
}

export async function leaveProject(req, res) {
  sendSuccess(res, await teamService.leaveProject(req.params.id, req.user));
}

export async function transferOwner(req, res) {
  sendSuccess(res, await teamService.transferProjectOwner(req.params.id, req.validated.body.userId, req.user));
}
