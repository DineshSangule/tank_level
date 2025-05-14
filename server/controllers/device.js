const { insertDevice, getDevices,deleteDevice } = require('../models/device');

exports.createDevice = async (req, res) => {
    try {
        const {
            deviceId,
            userId,
            deviceName,
            imei,
            area,
            startDate,
            expiryDate
        } = req.body;

       if (!deviceId || !userId || !deviceName) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        const result = await insertDevice({
            deviceId,
            userId,
            deviceName,
            imei,
            area,
            startDate,
            expiryDate
        });

        res.status(201).json({
            message: "Device Added Successfully.",
            insertedId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllDevices = async (req, res) => {
    try {
        const devices = await getDevices();  
        res.status(200).json(devices);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error Fetching devices',
            error: error.message
        });
    }
};


   
