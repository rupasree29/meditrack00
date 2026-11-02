/**
 * MediTrack - Authentication Controller (MySQL)
 */

const db = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      // In demo mode, accept demo emails or clinical fallback
      const namePart = email.split('@')[0];
      return res.json({
        user: {
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1).replace('.', ' '),
          email: email,
          role: 'Clinical Staff',
          avatar: namePart.substring(0, 2).toUpperCase()
        },
        token: 'demo-jwt-token-meditrack'
      });
    }

    const user = rows[0];
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.name.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase()
      },
      token: 'jwt-auth-session-key'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role || 'Clinical Staff', department || 'General']
    );

    res.status(201).json({ id: result.insertId, name, email, role, message: 'Staff user registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
