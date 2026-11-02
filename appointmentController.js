/**
 * MediTrack - Appointment Controller (MySQL)
 */

const db = require('../config/db');

exports.getAllAppointments = async (req, res) => {
  try {
    const query = `
      SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialization AS department
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, type, reason, notes } = req.body;
    
    const [last] = await db.query('SELECT id FROM appointments ORDER BY id DESC LIMIT 1');
    const nextId = (last[0] ? last[0].id : 0) + 1;
    const appointment_code = req.body.appointment_code || `APT-${200 + nextId}`;

    const [result] = await db.query(
      `INSERT INTO appointments (appointment_code, patient_id, doctor_id, appointment_date, appointment_time, type, reason, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [appointment_code, patient_id, doctor_id, appointment_date, appointment_time, type || 'Consultation', reason, notes, 'Upcoming']
    );

    res.status(201).json({ id: result.insertId, appointment_code, message: 'Appointment booked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [result] = await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment status updated to ' + status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reschedule = async (req, res) => {
  try {
    const { appointment_date, appointment_time } = req.body;
    const [result] = await db.query(
      'UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = "Rescheduled" WHERE id = ?',
      [appointment_date, appointment_time, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment rescheduled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const [result] = await db.query('UPDATE appointments SET status = "Cancelled" WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
