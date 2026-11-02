/**
 * MediTrack - Billing Controller (MySQL)
 */

const db = require('../config/db');

exports.getAllBillings = async (req, res) => {
  try {
    const query = `
      SELECT b.*, p.name AS patient_name, d.name AS doctor_name
      FROM billings b
      JOIN patients p ON b.patient_id = p.id
      LEFT JOIN doctors d ON b.doctor_id = d.id
      ORDER BY b.invoice_date DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBilling = async (req, res) => {
  try {
    const { patient_id, doctor_id, invoice_date, due_date, items, subtotal, tax_amount, discount_amount, total_amount, payment_status, payment_method, notes } = req.body;
    
    const [last] = await db.query('SELECT id FROM billings ORDER BY id DESC LIMIT 1');
    const nextId = (last[0] ? last[0].id : 0) + 1;
    const invoice_code = req.body.invoice_code || `INV-${7800 + nextId}`;

    const itemsJson = JSON.stringify(items || []);

    const [result] = await db.query(
      `INSERT INTO billings (invoice_code, patient_id, doctor_id, invoice_date, due_date, items_json, subtotal, tax_amount, discount_amount, total_amount, payment_status, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoice_code, patient_id, doctor_id || null, invoice_date, due_date, itemsJson, subtotal, tax_amount, discount_amount, total_amount, payment_status || 'Pending', payment_method, notes]
    );

    res.status(201).json({ id: result.insertId, invoice_code, total_amount, message: 'Invoice generated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;
    const [result] = await db.query(
      'UPDATE billings SET payment_status = ?, payment_method = COALESCE(?, payment_method) WHERE id = ?',
      [payment_status, payment_method || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice payment status updated to ' + payment_status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
