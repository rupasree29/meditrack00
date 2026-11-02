/**
 * MediTrack - Healthcare Management System Backend Server
 * Express.js REST API with MySQL Database Integration
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'MediTrack Healthcare Management System',
    timestamp: new Date().toISOString()
  });
});

// Modular Routes
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Bulk Sync endpoint
app.post('/api/sync', async (req, res) => {
  try {
    const { patients, doctors, appointments, medicalRecords, medicines, billings } = req.body;
    console.log('Received sync payload from frontend');
    res.json({ message: 'Synchronized with MediTrack backend successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🏥 MediTrack Healthcare REST API Server`);
  console.log(`🚀 Running at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});

module.exports = app;
