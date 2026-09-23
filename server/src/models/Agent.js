const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    nameKey: {
      type: String,
      required: true,
      select: false,
    },

    // null means the agent works individually.
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

agentSchema.pre('validate', function normalizeName(next) {
  if (typeof this.name === 'string') {
    this.name = this.name.trim().replace(/\s+/g, ' ');
    this.nameKey = this.name.toLowerCase();
  }

  next();
});

// Same name is allowed in different teams, but not twice in one team.
agentSchema.index(
  { company: 1, team: 1, nameKey: 1 },
  { unique: true }
);

module.exports = mongoose.model('Agent', agentSchema);
