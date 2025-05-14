const db = require('../config/db');

exports.insertDevice = async (deviceData) => {
    const [result] = await db.execute(
        `INSERT INTO devices 
        (deviceId, userId, deviceName, imei, area,  startDate, expiryDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            deviceData.deviceId,
            deviceData.userId,
            deviceData.deviceName,
            deviceData.imei,
            deviceData.area,
            deviceData.startDate,
            deviceData.expiryDate
        ]
    );
    return result;
};

exports.getDevices = async () => {
    const [rows] = await db.execute('SELECT * FROM devices');
    return rows;
};

