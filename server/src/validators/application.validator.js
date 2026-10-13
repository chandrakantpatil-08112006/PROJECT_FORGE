import { z } from 'zod';
import { LIMITS } from '../constants/enums.js';
import { objectIdField, objectIdList, objectIdParams } from './common.js';

export const createApplicationSchema = {
  params: objectIdParams,
  body: z.object({
    roleId: objectIdField('Role id'),
    message: z.string().trim().max(2000, 'Message must be at most 2000 characters').default(''),
    relevantSkills: objectIdList('Relevant skills', { max: LIMITS.SKILLS_MAX }).default([]),
  }),
};

export const applicationParamsSchema = {
  params: objectIdParams.extend({ applicationId: objectIdField('Application id') }),
};

export const decideApplicationSchema = {
  ...applicationParamsSchema,
  body: z.object({ status: z.enum(['accepted', 'rejected']) }),
};

export const listApplicationsSchema = {
  params: objectIdParams,
  query: z.object({ status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn', 'ended', 'all']).default('pending') }),
};

export const myApplicationsSchema = {
  query: z.object({ status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn', 'ended', 'all']).default('all') }),
};

export const teamMemberParamsSchema = {
  params: objectIdParams.extend({ memberId: objectIdField('Member id') }),
};

export const transferOwnerSchema = {
  params: objectIdParams,
  body: z.object({ userId: objectIdField('New owner id') }),
};
