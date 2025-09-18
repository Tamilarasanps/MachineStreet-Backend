const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const httpServer = http.createServer(app); //create http server for app

const io = new Server(httpServer, {
  // enabling cors
  cors: {
    origin: ["http://localhost:8081", "http://localhost:5000","http://192.168.1.10:5000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//  socket connection

io.on("connection", (socket) => {
  console.log("A client connected with ID:", socket.id);
  const rawCookie = socket.handshake.headers.cookie; //get cookies

  if (!rawCookie || rawCookie === "undefined") {
    return socket.disconnect();
  }
  const parsedCookie = cookie.parse(rawCookie); //parse cookie
  const token = socket.handshake.query.token || parsedCookie.authToken; //get actual token

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
