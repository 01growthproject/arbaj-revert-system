const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
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

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // agentName remains as a snapshot so old reports never change after rename.
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

    // teamName also remains as the historical snapshot.
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

    reportDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    totalCalls: { type: Number, default: 0, min: 0 },
    interested: { type: Number, default: 0, min: 0 },
    notInterested: { type: Number, default: 0, min: 0 },
    noPassport: { type: Number, default: 0, min: 0 },
    docsReceived: { type: Number, default: 0, min: 0 },
    notPickCalls: { type: Number, default: 0, min: 0 },
    totalLeadsReceived: { type: Number, default: 0, min: 0 },

    other: {
      type: String,
      default: '',
      trim: true,
    },

    addReview: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ companyId: 1, reportDate: -1 });
reportSchema.index({ companyId: 1, agentId: 1, reportDate: -1 });
reportSchema.index({ companyId: 1, teamId: 1, reportDate: -1 });

module.exports = mongoose.model('Report', reportSchema);
