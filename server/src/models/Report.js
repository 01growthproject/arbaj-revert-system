const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    enum: [
      'Growth Overseas International Edutech',
      'Famous Visa Consultant',
      'Ocean Global Overseas'
    ]
  },
  agentName: {
    type: String,
    required: true,
    trim: true
  },
  reportDate: {
    type: String, // "YYYY-MM-DD"
    required: true
  },
  totalCalls: { type: Number, default: 0 },
  interested: { type: Number, default: 0 },
  notInterested: { type: Number, default: 0 },
  noPassport: { type: Number, default: 0 },
  docsReceived: { type: Number, default: 0 },
  notPickCalls: { type: Number, default: 0 },
  totalLeadsReceived: { type: Number, default: 0 },
  other: { type: String, default: '' },
  addReview: { type: String, default: '' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
