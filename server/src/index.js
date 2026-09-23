const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const agentRoutes = require('./routes/agentRoutes');
const assignedLeadRoutes = require('./routes/assignedLeadRoutes');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const reportRoutes = require('./routes/reportRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/assigned-leads', assignedLeadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Arbaj Revert System API is running' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error('DB connection error:', error);
    process.exitCode = 1;
  });  


  
