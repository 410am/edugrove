const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 5173;

// CORS 설정
app.use(
  cors({
    cors: {
      // origin: [`http://localhost:${5173}`],
      origin: "*",
    },
  })
);

// socket io server
const io = new Server(httpServer, {
  cors: {
    // origin: [`http://localhost:${5173}`],
    origin: "*",
  },
});

const roomMembers = {};

io.on("connection", (socket) => {
  socket.on("enter_room", (RN, nickname) => {
    // 방에 입장
    console.log(`User ${nickname} joined room: ${RN}`);

    if (!roomMembers[RN]) {
      roomMembers[RN] = {};
    }
    roomMembers[RN][socket.id] = nickname;

    socket.to(RN).emit("updateMembers", Object.values(roomMembers[RN]));
    socket.emit("RN", RN);
    socket.join(RN);
    socket.to(RN).emit("welcome");
    console.log(io.sockets.adapter.rooms);
  });
  socket.on("offer", (offer, RN) => {
    socket.to(RN).emit("offer", offer);
  });
  socket.on("answer", (answer, RN) => {
    socket.to(RN).emit("answer", answer);
  });
  socket.on("ice", (ice, RN) => {
    socket.to(RN).emit("ice", ice);
  });
  socket.on("disconnect", (RN, nickname) => {
    console.log("Client disconnected");
  });

  // 메시지
  socket.on("message", (message, RN, nickname) => {
    console.log(io.sockets.adapter.rooms); // 방 정보 확인
    io.to(RN).emit("newMessage", { nickname: nickname, message: message });
  });
});

httpServer.listen(3000, () => {
  console.log("서버 연결 성공!");
});
