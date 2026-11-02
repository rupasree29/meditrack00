/**
 * MediTrack - Doctor Controller (MySQL)
 */

const db = require('../config/db');

exports.getAllDoctors = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM doctors ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Doctor not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { name, specialization, qualification, experience_years, email, phone, room_number, consultation_fee, availability_status, schedule_hours } = req.body;
    const [result] = await db.query(
      `INSERT INTO doctors (name, specialization, qualification, experience_years, email, phone, room_number, consultation_fee, availability_status, schedule_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, specialization, qualification, experience_years || 5, email, phone, room_number, consultation_fee || 100, availability_status || 'Available', schedule_hours]
    );
    res.status(201).json({ id: result.insertId, name, message: 'Doctor profile created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { name, specialization, qualification, experience_years, email, phone, room_number, consultation_fee, availability_status, schedule_hours } = req.body;
    const [result] = await db.query(
      `UPDATE doctors SET name = ?, specialization = ?, qualification = ?, experience_years = ?, email = ?, phone = ?, room_number = ?, consultation_fee = ?, availability_status = ?, schedule_hours = ?
       WHERE id = ?`,
      [name, specialization, qualification, experience_years, email, phone, room_number, consultation_fee, availability_status, schedule_hours, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor profile updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { availability_status } = req.body;
    const [result] = await db.query('UPDATE doctors SET availability_status = ? WHERE id = ?', [availability_status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Availability updated to ' + availability_status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
