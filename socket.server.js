const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const httpServer = http.createServer(app); //create http server for app
console.log('socket reached')
const io = new Server(httpServer, {
  // enabling cors
  cors: {
    origin: ["https://machinestreets.com", "https://api.machinestreets.com",
      //  "http://localhost:8081",
      // "http://192.168.1.10:8081",
      // "http://10.255.87.158:5000",
      // "http://192.168.1.10:5000",
      ],       
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//  socket connection

io.on("connection", (socket) => {
  console.log("A client connected with ID:", socket.id);
  let token;

  // Prefer token from query (mobile/web RN)
  if (socket.handshake.query?.token) {
    token = socket.handshake.query.token;
  } else {
    // fallback: from cookie (browser case)
    const rawCookie = socket.handshake.headers.cookie;
    console.log('socket server :', rawCookie)

    if (rawCookie && rawCookie !== "undefined") {
      const parsedCookie = cookie.parse(rawCookie);
      token = parsedCookie?.authToken;
    }
  }

  if (!token) {
    console.log("❌ No token provided, disconnecting");
    return socket.disconnect();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      const userId = decoded.userId;
      const connectedUsers = Array.from(io.sockets.sockets.keys());
      console.log("connectedUsers :", connectedUsers);
    }
  } catch (err) {
    return socket.disconnect();
  }


});

module.exports = { app, io, httpServer, express };
