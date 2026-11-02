/**
 * MediTrack - Medicine Controller (MySQL)
 */

const db = require('../config/db');

exports.getAllMedicines = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medicines ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const { name, generic_name, category, stock_quantity, unit, unit_price, expiry_date, supplier, min_stock_threshold } = req.body;
    
    const [last] = await db.query('SELECT id FROM medicines ORDER BY id DESC LIMIT 1');
    const nextId = (last[0] ? last[0].id : 0) + 1;
    const code = req.body.code || `MED-${nextId < 10 ? '00' : '0'}${nextId}`;

    const [result] = await db.query(
      `INSERT INTO medicines (code, name, generic_name, category, stock_quantity, unit, unit_price, expiry_date, supplier, min_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, generic_name, category, stock_quantity || 0, unit || 'Tablets', unit_price || 0.00, expiry_date, supplier, min_stock_threshold || 25]
    );

    res.status(201).json({ id: result.insertId, code, name, message: 'Medicine added to inventory' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { name, generic_name, category, stock_quantity, unit, unit_price, expiry_date, supplier, min_stock_threshold } = req.body;
    const [result] = await db.query(
      `UPDATE medicines SET name = ?, generic_name = ?, category = ?, stock_quantity = ?, unit = ?, unit_price = ?, expiry_date = ?, supplier = ?, min_stock_threshold = ?
       WHERE id = ?`,
      [name, generic_name, category, stock_quantity, unit, unit_price, expiry_date, supplier, min_stock_threshold, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { delta } = req.body;
    const [result] = await db.query(
      'UPDATE medicines SET stock_quantity = GREATEST(0, stock_quantity + ?) WHERE id = ?',
      [Number(delta), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Stock quantity adjusted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM medicines WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine removed from pharmacy' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
