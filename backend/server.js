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
      origin: [`http://localhost:${5173}`],
    },
  })
);

// socket io server
const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:${5173}`,
  },
});

io.on("connection", (socket) => {
  socket.on("enter_room", (RN) => {
    // 방에 입장
    socket.join(RN);
    socket.emit("RN", RN);
    console.log(`User ${socket.id} joined room: ${RN}`);
    socket.to(RN).emit("welcome");
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

  // 메시지
  socket.on("message", (message, RN, nickname) => {
    console.log(io.sockets.adapter.rooms); // 방 정보 확인
    io.to(RN).emit("newMessage", { nickname: nickname, message: message });
  });
});

httpServer.listen(3000, () => {
  console.log("서버 연결 성공!");
});
