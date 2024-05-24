const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 5173;

// CORS 설정
app.use(cors());

// socket io server
const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:${5173}`,
  },
});

io.on("connection", (socket) => {
  socket.on("enter_room", (RN) => {
    socket.join(RN);
    console.log(socket.rooms);
    console.log(socket.adapter.rooms);
    socket.emit("RN", RN);
  });
  socket.on("messages", (message, nickname) => {
    console.log(message);
    socket.emit("newMessage", message, nickname);
  });
});

httpServer.listen(3000, () => {
  console.log("서버 연결 성공!");
});
