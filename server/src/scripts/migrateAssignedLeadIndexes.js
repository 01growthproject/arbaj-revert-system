require('dotenv').config();

const mongoose = require('mongoose');
const AssignedLead = require('../models/AssignedLead');

const migrateAssignedLeadIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const collection = AssignedLead.collection;
    const indexes = await collection.indexes();
    const oldIndex = indexes.find(
      (index) => index.name === 'agentName_1_company_1_assignedDate_1'
    );

    if (oldIndex) {
      await collection.dropIndex(oldIndex.name);
      console.log('Old assigned-lead text index removed');
    }

    await AssignedLead.syncIndexes();
    console.log('Assigned-lead indexes updated successfully');
  } catch (error) {
    console.error('Assigned-lead index migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

migrateAssignedLeadIndexes();
