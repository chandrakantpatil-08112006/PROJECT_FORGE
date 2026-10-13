import mongoose from 'mongoose';
import { LIMITS } from '../constants/enums.js';

const applicationSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    relevantSkills: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
      default: [],
      validate: { validator: (ids) => ids.length <= LIMITS.SKILLS_MAX, message: `Choose at most ${LIMITS.SKILLS_MAX} relevant skills` },
    },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'ended'], default: 'pending' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// A person can have only one active application per project; they can reapply after withdrawal.
applicationSchema.index(
  { project: 1, applicant: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'accepted'] } } },
);
applicationSchema.index({ project: 1, status: 1, createdAt: 1 });
applicationSchema.index({ applicant: 1, status: 1, createdAt: -1 });

applicationSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
});

export const Application = mongoose.model('Application', applicationSchema);
