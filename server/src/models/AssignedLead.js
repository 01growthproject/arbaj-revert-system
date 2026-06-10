const mongoose = require('mongoose');

// ✅ Admin jo leads assign karta hai agent ko — yeh model store karta hai
const assignedLeadSchema = new mongoose.Schema({
  agentName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    enum: [
      'Growth Overseas International Edutech',
      'Famous Visa Consultant',
      'Ocean Global Overseas'
    ]
  },
  assignedDate: {
    type: String, // "YYYY-MM-DD"
    required: true
  },
  leadsAssigned: {
    type: Number,
    required: true,
    min: 0
  },
  assignedBy: {
    type: String,
    default: 'Admin'
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true })

// ✅ Ek agent ko ek din mein ek company ke liye sirf ek baar leads assign ho
assignedLeadSchema.index({ agentName: 1, company: 1, assignedDate: 1 }, { unique: true })

module.exports = mongoose.model('AssignedLead', assignedLeadSchema)