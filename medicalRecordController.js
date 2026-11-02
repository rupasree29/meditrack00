/**
 * MediTrack - Medical Record Controller (MySQL)
 */

const db = require('../config/db');

exports.getAllRecords = async (req, res) => {
  try {
    const query = `
      SELECT r.*, p.name AS patient_name, d.name AS doctor_name
      FROM medical_records r
      JOIN patients p ON r.patient_id = p.id
      JOIN doctors d ON r.doctor_id = d.id
      ORDER BY r.visit_date DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const { patient_id, doctor_id, visit_date, symptoms, diagnosis, treatment, lab_tests, follow_up_date, prescriptions } = req.body;
    
    const [last] = await db.query('SELECT id FROM medical_records ORDER BY id DESC LIMIT 1');
    const nextId = (last[0] ? last[0].id : 0) + 1;
    const record_code = req.body.record_code || `REC-${500 + nextId}`;

    const prescriptionsJson = JSON.stringify(prescriptions || []);

    const [result] = await db.query(
      `INSERT INTO medical_records (record_code, patient_id, doctor_id, visit_date, symptoms, diagnosis, treatment, lab_tests, follow_up_date, prescriptions_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [record_code, patient_id, doctor_id, visit_date, symptoms, diagnosis, treatment, lab_tests, follow_up_date, prescriptionsJson]
    );

    res.status(201).json({ id: result.insertId, record_code, message: 'Clinical encounter filed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM medical_records WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Medical record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
