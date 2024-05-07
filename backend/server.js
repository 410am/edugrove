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
  console.log(`소켓 연결 성공!! User Connected : ${socket.id}`);
  // 클라이언트로부터 메시지를 받았을 때 실행되는 이벤트
  socket.on("message", (message) => {
    console.log("받은 메시지:", message);
    // 클라이언트에게 받은 메시지를 그대로 다시 보냄
    socket.emit("message", message);
  });
});

httpServer.listen(3000, () => {
  console.log("서버 연결 성공!");
});
