import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import EntrancePage from "./pages/EntrancePage";
import VideoChatPage from "./pages/VideoChatPage";
import NavBar from "./NavBar";
import Modal from "react-modal";
import { UserProvider } from "./UserContext";

const Layout = () => {
  return (
    <div className="">
      <NavBar />
      <Outlet />
    </div>
  );
};

// 모달의 루트 요소를 설정합니다.
Modal.setAppElement("#root");

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<EntrancePage />} />
          <Route path="/" element={<Layout />}>
            {/* 추후 meet 대신 room_34234 이런식으로 바뀌어야함 */}
            {/* <Route path="/meet" element={<VideoChatPage />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
