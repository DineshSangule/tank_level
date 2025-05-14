const express = require('express');
const dotenv = require('dotenv');
const cors = require ('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app=express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 

const deviceRoutes = require('./routes/device');
app.use('/api/devices',deviceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT,() =>
{
    console.log(`server running on http://localhost:${PORT}`);
});
