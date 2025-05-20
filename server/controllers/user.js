const jwt = require('jsonwebtoken');
const { addUser, getUserByUserId } = require('../models/user');
require('dotenv').config();


const createUser = async (req, res) => {
   // console.log('Received body:', req.body); // Debugging line

//console.log('Headers:', req.headers);

  try {


    const { userId, name, password, mobile,role } = req.body;
     if (!userId || !name || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  if (!['Admin', 'User'].includes(role)) {
  return res.status(400).json({ message: 'Role must be Admin or User' });
}
    const existingUser = await getUserByUserId(userId);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    await addUser({ userId, name, password, mobile });
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

const getAllUsers = (req, res) => {
  const sql = 'SELECT * FROM userss';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error fetching users' });
    }
    res.status(200).json(results);
  });
};



const loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ message: 'Please enter both username and password' });
    }

    const user = await getUserByUserId(userId);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        mobile: user.mobile
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};



module.exports = { createUser, loginUser ,getAllUsers};
