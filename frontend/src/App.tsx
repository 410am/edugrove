import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import EntrancePage from "./pages/EntrancePage";
import VideoChatPage from "./pages/VideoChatPage";
import NavBar from "./NavBar";
import Modal from "react-modal";
import io from "socket.io-client";
import { ChangeEvent, useEffect, useState } from "react";

const Layout = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};

// 모달의 루트 요소를 설정합니다.
Modal.setAppElement("#root");

const App = () => {
  const socket = io("http://localhost:3000");
  console.log(socket);
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState("");

  useEffect(() => {
    // 백엔드 서버로부터 받은 메시지를 처리하는 핸들러
    socket.on("message", (message) => {
      setReceivedMessage(message);
    });
  }, [message]);

  // 메시지를 보내는 함수
  const sendMessage = () => {
    socket.emit("message", message);
    setMessage(""); // 입력 필드 초기화
  };

  const handleRNSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<EntrancePage />} />
            {/* 추후 meet 대신 room_34234 이런식으로 바뀌어야함 */}
            <Route path="/meet" element={<VideoChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <h1>WebSocket 통신 예제</h1>
      <form
        onSubmit={(e) => {
          // send 누른 뒤 랜더링 방지
          e?.preventDefault();
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => {
            handleRNSubmit(e);
          }}
        />
        <button id="submit" type="submit" onClick={sendMessage}>
          Send
        </button>
        <p>받은 메시지: {receivedMessage}</p>
      </form>
    </div>
  );
};

export default App;
