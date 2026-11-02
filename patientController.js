/**
 * MediTrack - Patient Controller (MySQL)
 */

const db = require('../config/db');

// GET all patients
exports.getAllPatients = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET single patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE new patient
exports.createPatient = async (req, res) => {
  try {
    const { name, age, gender, blood_group, phone, email, address, emergency_contact, medical_condition, bed_room, status, admission_date } = req.body;
    
    // Auto-generate patient_code if missing
    const [last] = await db.query('SELECT id FROM patients ORDER BY id DESC LIMIT 1');
    const nextId = (last[0] ? last[0].id : 0) + 1;
    const patient_code = req.body.patient_code || `PT-${1000 + nextId}`;

    const [result] = await db.query(
      `INSERT INTO patients (patient_code, name, age, gender, blood_group, phone, email, address, emergency_contact, medical_condition, bed_room, status, admission_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_code, name, age, gender, blood_group, phone, email, address, emergency_contact, medical_condition, bed_room || 'Outpatient', status || 'Inpatient', admission_date || new Date()]
    );

    res.status(201).json({ id: result.insertId, patient_code, name, message: 'Patient registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE patient
exports.updatePatient = async (req, res) => {
  try {
    const { name, age, gender, blood_group, phone, email, address, emergency_contact, medical_condition, bed_room, status } = req.body;
    const [result] = await db.query(
      `UPDATE patients SET name = ?, age = ?, gender = ?, blood_group = ?, phone = ?, email = ?, address = ?, emergency_contact = ?, medical_condition = ?, bed_room = ?, status = ?
       WHERE id = ?`,
      [name, age, gender, blood_group, phone, email, address, emergency_contact, medical_condition, bed_room, status, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient details updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE patient
exports.deletePatient = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
