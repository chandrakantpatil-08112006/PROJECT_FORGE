import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import * as applicationController from '../controllers/application.controller.js';
import * as teamController from '../controllers/team.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate.js';
import { createContentLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  applicationParamsSchema,
  createApplicationSchema,
  decideApplicationSchema,
  listApplicationsSchema,
  myApplicationsSchema,
  teamMemberParamsSchema,
  transferOwnerSchema,
} from '../validators/application.validator.js';
import {
  changeStatusSchema,
  createProjectSchema,
  listProjectsSchema,
  myProjectsSchema,
  projectIdSchema,
  updateProjectSchema,
} from '../validators/project.validator.js';

const router = Router();

router.get('/applications/mine', authenticate, validate(myApplicationsSchema), applicationController.listMine);
router.get('/applications/received', authenticate, validate(myApplicationsSchema), applicationController.listReceived);

router.get('/', validate(listProjectsSchema), projectController.list);
// Must be declared before '/:id' or "mine" would be treated as a project id.
router.get('/mine', authenticate, validate(myProjectsSchema), projectController.mine);
router.post('/', authenticate, createContentLimiter, validate(createProjectSchema), projectController.create);

router.post('/:id/applications', authenticate, createContentLimiter, validate(createApplicationSchema), applicationController.create);
router.get('/:id/applications', authenticate, validate(listApplicationsSchema), applicationController.listForProject);
router.patch('/:id/applications/:applicationId', authenticate, validate(decideApplicationSchema), applicationController.decide);
router.delete('/:id/applications/:applicationId', authenticate, validate(applicationParamsSchema), applicationController.withdraw);
router.delete('/:id/team/me', authenticate, validate(projectIdSchema), teamController.leaveProject);
router.delete('/:id/team/:memberId', authenticate, validate(teamMemberParamsSchema), teamController.removeMember);
router.patch('/:id/owner', authenticate, validate(transferOwnerSchema), teamController.transferOwner);

router.get('/:id', optionalAuthenticate, validate(projectIdSchema), projectController.get);
router.patch('/:id', authenticate, validate(updateProjectSchema), projectController.update);
router.delete('/:id', authenticate, validate(projectIdSchema), projectController.remove);

router.post('/:id/publish', authenticate, validate(projectIdSchema), projectController.publish);
router.post('/:id/unpublish', authenticate, validate(projectIdSchema), projectController.unpublish);
router.patch('/:id/status', authenticate, validate(changeStatusSchema), projectController.changeStatus);

export default router;
