const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const reportRoutes = require('./routes/reportRoutes')
const adminRoutes = require('./routes/adminRoutes')
const assignedLeadRoutes = require('./routes/assignedLeadRoutes') // ✅ New

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Routes
app.use('/api/reports', reportRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/assigned-leads', assignedLeadRoutes) // ✅ New

app.get('/', (req, res) => {
  res.json({ message: 'Arbaj Revert System API is running' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch(err => console.error('DB connection error:', err))