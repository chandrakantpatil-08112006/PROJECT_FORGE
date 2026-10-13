import * as applicationService from '../services/application.service.js';
import { sendCreated, sendSuccess } from '../utils/apiResponse.js';

export async function create(req, res) {
  sendCreated(res, await applicationService.createApplication(req.params.id, req.user, req.validated.body));
}

export async function listForProject(req, res) {
  sendSuccess(res, await applicationService.listProjectApplications(req.params.id, req.user, req.validated.query.status));
}

export async function listMine(req, res) {
  sendSuccess(res, await applicationService.listMyApplications(req.user, req.validated.query.status));
}

export async function listReceived(req, res) {
  sendSuccess(res, await applicationService.listReceivedApplications(req.user, req.validated.query.status));
}

export async function decide(req, res) {
  sendSuccess(res, await applicationService.decideApplication(
    req.params.id, req.params.applicationId, req.user, req.validated.body.status,
  ));
}

export async function withdraw(req, res) {
  sendSuccess(res, await applicationService.withdrawApplication(req.params.id, req.params.applicationId, req.user));
}
