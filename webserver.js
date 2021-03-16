var fs = require('fs'); //require filesystem module
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4, and specify that it is output
var path = require('path');
var hash = require('object-hash');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const {spawn} = require('child_process');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/database.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.use(cookieParser());

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public/style')))

app.get('/', function(req, res) {
  let key = [req.header("User-Agent"), "http://pi.inovatra.com/", req.ip];
  let search = "SELECT * FROM Users WHERE Agent = ? AND Referer = ? AND IP = ?";
  //console.log(key);
  db.get(search, key, (err, row) => {
    if (err) { return console.error(err.message); }
    if (row !== undefined){
      const alias = row.Alias;
      //console.log(alias);
      fs.readFile(path.join(__dirname, '/public/index.html'), 'utf8', function (err,data) {
        if (err) { return console.log(err); }
	data = data.replace("@hello", "<h2>Zdravo " + alias + "</h2>");
        res.cookie('userHash', hash(key), { maxAge: 900000, httpOnly: true });
	res.send(data);
      });
    } else {
      //console.log("unknown");
      fs.readFile(path.join(__dirname, '/public/index.html'), 'utf8', function (err,data) {
        if (err) { return console.log(err); }
	data = data.replace("@hello", "");
        res.send(data);
      });
    }
  });
  //res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.post('/logger', function(req, res) {
  const {width, height, innerWidth, innerHeight} = req.body;
  var user = {
    agent: req.header('user-agent'), // User Agent we get from headers
    referrer: req.header('referrer'), //  Likewise for referrer
    ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
    screen: { // Get screen info that we passed in url post data
      width: width,
      height: height,
      innerWidth: innerWidth,
      innerHeight: innerHeight
    }
  };
  // Store the user in your database

  let key = [user.agent, user.referrer, user.ip];
  let search = "SELECT * FROM Users WHERE Agent = ? AND Referer = ? AND IP = ?";
  db.get(search, key, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if(row === undefined){
      console.log("NOVI USER: ");
      let data = [user.agent, user.referrer, user.ip, "unknown", user.screen.width,
                  user.screen.height, user.screen.innerWidth, user.screen.innerHeight];
      let sql = "INSERT INTO Users (Agent, Referer, IP, Alias, Width, Height, InnerWidth, InnerHeight) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
      db.run(sql, data, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
      });
    } else {
      user["alias"] = row.Alias;
      console.log("STARI USER: ");
    }
    console.log(user);
  });
  res.end();
});

io.sockets.on('connection', function (socket) {// WebSocket Connection
  var lightvalue = 0; //static variable for current status

  socket.on('light', function(data) { //get light switch status from client
    lightvalue = data;
    console.log(lightvalue);
    if (lightvalue) {
      LED.writeSync(1);
    } else {
      LED.writeSync(0);
    }
  });

  socket.on('text', function(data) {
    text = data.substring(0, 80);
    //.replace(/[^\x00-\x7F]/g, "");
    console.log(data);
    doCall = true;
  });
});

var text = "pozz";
var doCall = true;

setInterval(function() {
  if(doCall){
    spawn('python3', ['oledText.py', text]);
    doCall = false;
  }
}, 500);

http.listen(80, () => {
  console.log('App running at http://24.135.59.73:80');
  LED.writeSync(1);
  setTimeout(function(){
   LED.writeSync(0);
  }, 500);
});
