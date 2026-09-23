const mongoose = require('mongoose');

const assignedLeadSchema = new mongoose.Schema(
  {
    // Snapshot fields keep old records readable after agent/team renames.
    agentName: {
      type: String,
      required: true,
      trim: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
      index: true,
    },

    teamName: {
      type: String,
      default: '',
      trim: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },

    assignedDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },

    leadsAssigned: {
      type: Number,
      required: true,
      min: 0,
    },

    assignedBy: {
      type: String,
      default: 'Admin',
      trim: true,
    },

    assignedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 250,
    },
  },
  { timestamps: true }
);

// Only one assignment per verified agent per date.
assignedLeadSchema.index(
  { agentId: 1, assignedDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      agentId: { $type: 'objectId' },
    },
  }
);

assignedLeadSchema.index({ companyId: 1, assignedDate: -1 });
assignedLeadSchema.index({ teamId: 1, assignedDate: -1 });

module.exports = mongoose.model('AssignedLead', assignedLeadSchema);
