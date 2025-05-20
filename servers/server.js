const mqtt = require("mqtt");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
var crc16 = require("js-crc").crc16;
const express = require("express");
const cors = require("cors");
const app = express();
var bodyParser = require("body-parser");
var cron = require("node-cron");
var Redis = require("ioredis");
var redis_client = new Redis("redis://redis:6379");

const jwtkey = "sjlkdnkfjalsdkjgfajshdf gsdkjfh sdljyfhg li7asygtef as.id7ftiug";
const port = 20018;

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);


const con = mysql.createConnection({
  host: "db",
  user: "root",
  password: "Pratap@123",
  database: "tank_level",
  timezone: "Asia/Kolkata"
});

con.connect(err => {
  if (err) console.log(err);
  else console.log("Connected to MySQL database");
});


var mqtt_client = mqtt.connect("mqtt://mqtt.agromationindia.com:20011");

mqtt_client.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqtt_client.subscribe("vidani/vl/+/data");
});

mqtt_client.on("error", error => {
  console.error("Error connecting to MQTT broker:", error);
});

mqtt_client.on("message", (topic, message) => {
  // console.log("Received message on topic:", topic);
  // console.log("Message:", message.toString());
  saveData(topic, message.toString());
});

function saveData(topic, message) {
  const imei = topic.split("/")[2];
  const data = JSON.parse(message);
  const ai = data['devices'][0]['ai'];
  let level = 0;
  if (ai[4])
    level = 100;
  else if (ai[3])
    level = 80;
  else if (ai[2])
    level = 60;
  else if (ai[1])
    level = 40;
  else if (ai[0])
    level = 20;
  else
    level = 0;
  const pumpStatus = ai[5] ? 1 : 0;
  const date = new Date();
  const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
  const formatedData = {
    level,
    pumpStatus,
    formattedDate
  }
  redis_client.set("vl:" + imei, JSON.stringify(formatedData), "EX", 300, (err, reply) => {
    if (err) console.log(err);
    else console.log(reply);
  });
}

cron.schedule("*/15 * * * *", () => {
  const query = "SELECT * FROM `device`";
  con.query(query, (err, result, fields) => {
    if (!err) {
      result.forEach(element => {
        const imei = element.uuid;
        redis_client.get("vl:" + imei).then(data1 => {
          console.log(data1);
          if (!data1) return;
          const formatedData = JSON.parse(data1);
          const level = formatedData.level;
          const pumpStatus = formatedData.pumpStatus;
          const date = formatedData.formattedDate;
          const query = "INSERT INTO `logs` (`device_id`, `level`, `run_time`, `date`) VALUES ('" + element.id + "', '" + level + "', '" + pumpStatus + "', '" + date + "')";
          con.query(query, (err, result, fields) => {
            if (err) console.log(err);
            else console.log(result);
          });
        });
      });
    }
  });
});

app.get("/", (request, response) => {
  response.send("API Working!");
});

// rest start
app.post("/login", (request, response) => {
  // console.log(request.body);
  // response.end();
  resp = {};
  const username = request.body.username;
  const password = request.body.password;
  const query =
    "SELECT * FROM `user` WHERE `username` LIKE '" +
    username +
    "' AND `password` LIKE '" +
    password +
    "'";
  con.query(query, (err, result, fields) => {
    // console.log(result);
    if (result[0]) {
      var jwtdata = {};
      var resp = {};
      jwtdata["id"] = result[0].id;
      jwtdata["username"] = username;
      resp["token"] = jwt.sign(jwtdata, jwtkey, {
        expiresIn: 86400
      });
      resp["id"] = result[0].id;
      resp["mqtt_token"] = crc16(resp["token"]);
      // redis_client.set("slUser:" + username, crc16(resp['mqtt_token'] + 'agroindia'));
      response.end(JSON.stringify(resp));
      // con.query("UPDATE `users` SET `lastlogin_time` = '', `lastlogin_ip` = '',  WHERE `id` = " + resp['id'],
      //   function (err, result1, fields) {
      //     response.end(JSON.stringify(resp));
      //   });
    } else {
      response.status(401).send({
        success: false,
        msg: "invalid login"
      });
    }
  });
});

app.get("/getDevices", (request, response) => {
  // console.log(jwt.decode(request.headers.authorization));
  jwt.verify(request.headers.authorization, jwtkey, (err, decoded) => {
    if (err || decoded.exp < new Date().getTime() / 1000) {
      response.status(401).send({
        success: false,
        msg: "Login Again"
      });
    } else {
      let id = decoded.id;
      const query = "SELECT * FROM `device` WHERE `user_id` = " + id;
      // console.log(id, query);
      con.query(query, (err, result, fields) => {
        if (!err) {
          response.status(200).send({
            success: true,
            msg: "Success",
            data: result
          });
        } else {
          response.status(400).send({
            success: false,
            msg: "No device found",
            data: {}
          });
        }
      });
    }
  });
});

app.post("/getReports", (request, response) => {
  // console.log(jwt.decode(request.headers.authorization));
  jwt.verify(request.headers.authorization, jwtkey, (err, decoded) => {
    if (err) {
      response.status(401).send({
        success: false,
        msg: "invalid login"
      });
    } else {
      resp = {};
      const id = request.body.id;
      const from = request.body.from;
      const to = request.body.to;
      // const query = "SELECT * FROM `logs` WHERE `device_id` = 3 AND `date` BETWEEN '2019-10-21 00:00:00.000000' AND '2019-11-15 00:00:00.000000'";
      const query = `SELECT * FROM hrs_log WHERE uuid = ${id} AND date BETWEEN '${from}' AND '${to}'`;

      console.log(id, query);
      con.query(query, (err, result, fields) => {
        if (!err) {
          response.status(200).send({
            success: true,
            msg: "Success",
            data: result
          });
        } else {
          response.status(400).send({
            success: false,
            msg: "Error to get data",
            data: {}
          });
        }
      });
    }
  });
});

app.post("/getMonthReports", (request, response) => {
  // console.log(jwt.decode(request.headers.authorization));
  jwt.verify(request.headers.authorization, jwtkey, (err, decoded) => {
    if (err) {
      response.status(401).send({
        success: false,
        msg: "invalid login"
      });
    } else {
      resp = {};
      const id = request.body.id;
      const from = request.body.from;
      const to = request.body.to;
      // const query = "SELECT * FROM `logs` WHERE `device_id` = 3 AND `date` BETWEEN '2019-10-21 00:00:00.000000' AND '2019-11-15 00:00:00.000000'";
      const query = `SELECT * FROM day_log WHERE uuid = ${id} AND date BETWEEN '${from}' AND '${to}'`;

      console.log(id, query);
      con.query(query, (err, result, fields) => {
        if (!err) {
          response.status(200).send({
            success: true,
            msg: "Success",
            data: result
          });
        } else {
          response.status(400).send({
            success: false,
            msg: "Error to get data",
            data: {}
          });
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
