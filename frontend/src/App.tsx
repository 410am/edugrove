import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import EntrancePage from "./pages/EntrancePage";
import VideoChatPage from "./pages/VideoChatPage";
import NavBar from "./NavBar";
import Modal from "react-modal";

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
    </div>
  );
};

export default App;
