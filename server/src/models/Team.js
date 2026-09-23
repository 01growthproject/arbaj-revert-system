const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
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
      maxlength: 80,
    },

    nameKey: {
      type: String,
      required: true,
      select: false,
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

teamSchema.pre('validate', function normalizeName(next) {
  if (typeof this.name === 'string') {
    this.name = this.name.trim().replace(/\s+/g, ' ');
    this.nameKey = this.name.toLowerCase();
  }

  next();
});

teamSchema.index(
  { company: 1, nameKey: 1 },
  { unique: true }
);

module.exports = mongoose.model('Team', teamSchema);
