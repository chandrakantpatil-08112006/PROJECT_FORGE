import { Project } from '../models/Project.js';
import { Application } from '../models/Application.js';
import { TeamMembership } from '../models/TeamMembership.js';
import { AppError } from '../utils/AppError.js';

async function loadProject(id) {
  const project = await Project.findById(id);
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

function assertOwner(project, user) {
  if (String(project.owner) !== String(user._id)) throw AppError.forbidden('Only the project owner can manage the team');
}

async function changeMembership(project, membership, action) {
  const role = membership.roleId ? project.roles.id(membership.roleId) : null;
  if (membership.roleId && !role) throw new AppError(409, 'ROLE_MISSING', 'The member role no longer exists');
  if (project.memberCount <= 1 || (role && role.filled <= 0)) {
    throw new AppError(409, 'TEAM_INCONSISTENT', 'Team counts need owner review before this change');
  }
  const query = { _id: project._id, memberCount: project.memberCount };
  if (role) query.roles = { $elemMatch: { _id: role._id, filled: role.filled } };
  const inc = { memberCount: -1 };
  if (role) inc['roles.$.filled'] = -1;
  const updatedProject = await Project.findOneAndUpdate(query, { $inc: inc }, { new: true });
  if (!updatedProject) throw new AppError(409, 'TEAM_CHANGED', 'The team changed. Refresh and try again.');

  const updatedMembership = await TeamMembership.findOneAndUpdate(
    { _id: membership._id, status: 'active', role: 'member' },
    { $set: { status: action, leftAt: new Date() } },
    { new: true },
  );
  if (!updatedMembership) {
    const rollback = { memberCount: 1 };
    if (role) rollback['roles.$[r].filled'] = 1;
    await Project.updateOne({ _id: project._id }, { $inc: rollback }, role ? { arrayFilters: [{ 'r._id': role._id }] } : undefined);
    throw new AppError(409, 'TEAM_CHANGED', 'The team changed. Refresh and try again.');
  }
  try {
    await Application.updateMany(
      { project: project._id, applicant: membership.user, status: 'accepted' },
      { $set: { status: 'ended', reviewedAt: new Date() } },
    );
  } catch (error) {
    await TeamMembership.updateOne({ _id: membership._id, status: action }, { $set: { status: 'active', leftAt: null } });
    const rollback = { memberCount: 1 };
    if (role) rollback['roles.$[r].filled'] = 1;
    await Project.updateOne({ _id: project._id }, { $inc: rollback }, role ? { arrayFilters: [{ 'r._id': role._id }] } : undefined);
    throw error;
  }
  return updatedMembership;
}

export async function removeTeamMember(projectId, memberId, owner) {
  const project = await loadProject(projectId);
  assertOwner(project, owner);
  const membership = await TeamMembership.findOne({ project: project._id, user: memberId, status: 'active', role: 'member' });
  if (!membership) throw AppError.notFound('Active team member not found');
  return changeMembership(project, membership, 'removed');
}

export async function leaveProject(projectId, user) {
  const project = await loadProject(projectId);
  if (String(project.owner) === String(user._id)) {
    throw AppError.conflict('Transfer ownership before leaving the project', undefined, 'OWNER_CANNOT_LEAVE');
  }
  const membership = await TeamMembership.findOne({ project: project._id, user: user._id, status: 'active', role: 'member' });
  if (!membership) throw AppError.notFound('Active team membership not found');
  return changeMembership(project, membership, 'left');
}

export async function transferProjectOwner(projectId, nextOwnerId, owner) {
  const project = await loadProject(projectId);
  assertOwner(project, owner);
  if (String(project.owner) === String(nextOwnerId)) throw new AppError(400, 'INVALID_OWNER', 'You are already the project owner');

  const currentOwnerMembership = await TeamMembership.findOne({ project: project._id, user: owner._id, role: 'owner', status: 'active' });
  const nextOwnerMembership = await TeamMembership.findOne({ project: project._id, user: nextOwnerId, role: 'member', status: 'active' });
  if (!currentOwnerMembership || !nextOwnerMembership) throw AppError.badRequest('The new owner must be an active team member');

  const previousSeat = {
    roleId: nextOwnerMembership.roleId,
    title: nextOwnerMembership.title,
  };
  const demoted = await TeamMembership.findOneAndUpdate(
    { _id: currentOwnerMembership._id, role: 'owner', status: 'active' },
    { $set: { role: 'member', roleId: previousSeat.roleId, title: previousSeat.title || 'Project Lead' } },
    { new: true },
  );
  if (!demoted) throw new AppError(409, 'TEAM_CHANGED', 'The team changed. Refresh and try again.');

  const promoted = await TeamMembership.findOneAndUpdate(
    { _id: nextOwnerMembership._id, role: 'member', status: 'active' },
    { $set: { role: 'owner', roleId: null, title: 'Project Lead' } },
    { new: true },
  );
  if (!promoted) {
    await TeamMembership.updateOne({ _id: demoted._id, role: 'member' }, { $set: { role: 'owner', roleId: null, title: 'Project Lead' } });
    throw new AppError(409, 'TEAM_CHANGED', 'The team changed. Refresh and try again.');
  }

  const transferred = await Project.findOneAndUpdate(
    { _id: project._id, owner: owner._id },
    { $set: { owner: nextOwnerMembership.user } },
    { new: true },
  );
  if (!transferred) {
    await TeamMembership.updateOne({ _id: promoted._id, role: 'owner' }, { $set: { role: 'member', roleId: previousSeat.roleId, title: previousSeat.title } });
    await TeamMembership.updateOne({ _id: demoted._id, role: 'member' }, { $set: { role: 'owner', roleId: null, title: 'Project Lead' } });
    throw new AppError(409, 'TEAM_CHANGED', 'The project owner changed. Refresh and try again.');
  }
  return transferred;
}
