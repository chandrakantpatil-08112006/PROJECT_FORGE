import { Application } from '../models/Application.js';
import { Project } from '../models/Project.js';
import { TeamMembership } from '../models/TeamMembership.js';
import { User } from '../models/User.js';
import { canViewProject } from '../policies/project.policy.js';
import { AppError } from '../utils/AppError.js';

const APPLICANT_FIELDS = 'name username avatarUrl bio skills experienceLevel';

async function loadProject(id) {
  const project = await Project.findById(id);
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

function assertOwner(project, user) {
  if (String(project.owner) !== String(user._id)) throw AppError.forbidden('Only the project owner can manage applications');
}

function populateApplications(query) {
  return query.populate('applicant', APPLICANT_FIELDS)
    .populate('project', 'title status owner roles teamSize memberCount')
    .populate('relevantSkills', 'name slug category');
}

export async function createApplication(projectId, applicant, { roleId, message, relevantSkills }) {
  const project = await loadProject(projectId);
  if (!canViewProject(project, applicant)) throw AppError.notFound('Project not found');
  if (project.status !== 'recruiting') throw new AppError(422, 'PROJECT_NOT_RECRUITING', 'This project is not accepting applications');
  if (String(project.owner) === String(applicant._id)) throw AppError.forbidden('You cannot apply to your own project');

  const role = project.roles.id(roleId);
  if (!role) throw AppError.notFound('Role not found');
  if (role.filled >= role.slots) throw new AppError(409, 'ROLE_FULL', 'This role has no open spots');
  if (await TeamMembership.exists({ project: project._id, user: applicant._id, status: 'active' })) {
    throw AppError.conflict('You are already on this project team', undefined, 'ALREADY_MEMBER');
  }
  const profileSkillIds = new Set((applicant.skills ?? []).map(String));
  if (relevantSkills.some((id) => !profileSkillIds.has(String(id)))) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Some fields are invalid', [
      { field: 'relevantSkills', message: 'Choose relevant skills from your profile' },
    ]);
  }

  try {
    return await Application.create({ project: project._id, applicant: applicant._id, roleId: role._id, message, relevantSkills });
  } catch (error) {
    if (error?.code === 11000) throw AppError.conflict('You already have an active application for this project', undefined, 'APPLICATION_EXISTS');
    throw error;
  }
}

export async function listProjectApplications(projectId, owner, status) {
  const project = await loadProject(projectId);
  assertOwner(project, owner);
  const filter = { project: project._id, ...(status === 'all' ? {} : { status }) };
  return populateApplications(Application.find(filter).sort({ createdAt: 1 }));
}

export async function listMyApplications(user, status) {
  const filter = { applicant: user._id, ...(status === 'all' ? {} : { status }) };
  return populateApplications(Application.find(filter).sort({ createdAt: -1 }));
}

export async function listReceivedApplications(owner, status = 'pending') {
  const projects = await Project.find({ owner: owner._id }).select('_id');
  const projectIds = projects.map(({ _id }) => _id);
  if (projectIds.length === 0) return [];
  const filter = { project: { $in: projectIds }, ...(status === 'all' ? {} : { status }) };
  return populateApplications(Application.find(filter).sort({ createdAt: -1 }));
}

export async function decideApplication(projectId, applicationId, owner, decision) {
  const project = await loadProject(projectId);
  assertOwner(project, owner);
  const application = await Application.findOne({ _id: applicationId, project: project._id });
  if (!application) throw AppError.notFound('Application not found');
  if (application.status !== 'pending') throw new AppError(409, 'APPLICATION_ALREADY_REVIEWED', 'This application is no longer pending');

  if (decision === 'rejected') {
    const rejected = await Application.findOneAndUpdate(
      { _id: application._id, status: 'pending' },
      { $set: { status: 'rejected', reviewedAt: new Date() } },
      { new: true },
    );
    if (!rejected) throw new AppError(409, 'APPLICATION_ALREADY_REVIEWED', 'This application is no longer pending');
    return rejected;
  }

  const role = project.roles.id(application.roleId);
  if (!role || project.status !== 'recruiting') throw new AppError(422, 'PROJECT_NOT_RECRUITING', 'This project cannot accept new team members');
  if (role.filled >= role.slots) throw new AppError(409, 'ROLE_FULL', 'This role has no open spots');
  if (project.memberCount >= project.teamSize) throw new AppError(409, 'TEAM_FULL', 'This project team is full');
  const applicant = await User.findById(application.applicant);
  if (!applicant || applicant.status !== 'active') throw new AppError(422, 'APPLICANT_UNAVAILABLE', 'This applicant account is unavailable');
  const priorMembership = await TeamMembership.findOne({ project: project._id, user: applicant._id });
  if (priorMembership?.status === 'active') {
    throw AppError.conflict('This applicant is already on the team', undefined, 'ALREADY_MEMBER');
  }

  // Conditionally update persisted counters so concurrent acceptances cannot overfill the team.
  const updated = await Project.findOneAndUpdate(
    {
      _id: project._id,
      status: 'recruiting',
      memberCount: project.memberCount,
      teamSize: project.teamSize,
      roles: { $elemMatch: { _id: role._id, filled: role.filled, slots: role.slots } },
    },
    { $inc: { memberCount: 1, 'roles.$.filled': 1 } },
    { new: true },
  );
  if (!updated) throw new AppError(409, 'ROLE_FULL', 'The role or project team has no open spots');

  let membershipCreated = false;
  let membershipReactivated = false;
  const previousMembership = priorMembership?.toObject();
  try {
    if (priorMembership) {
      const restored = await TeamMembership.findOneAndUpdate(
        { _id: priorMembership._id, status: priorMembership.status },
        { $set: { status: 'active', role: 'member', title: role.title, roleId: role._id, joinedAt: new Date(), leftAt: null } },
        { new: true },
      );
      if (!restored) throw AppError.conflict('This team membership changed. Refresh and try again.', undefined, 'TEAM_CHANGED');
      membershipReactivated = true;
    } else {
      await TeamMembership.create({
        project: project._id,
        user: applicant._id,
        role: 'member',
        title: role.title,
        roleId: role._id,
      });
      membershipCreated = true;
    }
    const result = await Application.updateOne(
      { _id: application._id, status: 'pending' },
      { $set: { status: 'accepted', reviewedAt: new Date() } },
    );
    if (result.modifiedCount !== 1) throw new AppError(409, 'APPLICATION_ALREADY_REVIEWED', 'This application is no longer pending');
  } catch (error) {
    if (membershipCreated) await TeamMembership.deleteOne({ project: project._id, user: applicant._id, role: 'member' });
    if (membershipReactivated) {
      await TeamMembership.updateOne({ _id: priorMembership._id, status: 'active' }, {
        $set: {
          status: previousMembership.status,
          role: previousMembership.role,
          title: previousMembership.title,
          roleId: previousMembership.roleId,
          joinedAt: previousMembership.joinedAt,
          leftAt: previousMembership.leftAt,
        },
      });
    }
    await Project.updateOne({ _id: project._id }, { $inc: { memberCount: -1, 'roles.$[r].filled': -1 } }, { arrayFilters: [{ 'r._id': role._id }] });
    if (error?.code === 11000) throw AppError.conflict('This applicant is already on the team', undefined, 'ALREADY_MEMBER');
    throw error;
  }
  return Application.findById(application._id);
}

export async function withdrawApplication(projectId, applicationId, applicant) {
  const application = await Application.findOneAndUpdate(
    { _id: applicationId, project: projectId, applicant: applicant._id, status: 'pending' },
    { $set: { status: 'withdrawn', reviewedAt: new Date() } },
    { new: true },
  );
  if (!application) throw AppError.notFound('Pending application not found');
  return application;
}
