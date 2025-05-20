const express = require('express');
const router = express.Router();
const { createUser, loginUser} = require('../controllers/user');

router.post('/add', createUser); 
router.post('/login', loginUser);  

module.exports = router;
