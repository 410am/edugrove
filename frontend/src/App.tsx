import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import EntrancePage from "./pages/EntrancePage";
import VideoChatPage from "./pages/VideoChatPage";
import NavBar from "./NavBar";
import Modal from "react-modal";
import { User } from "@firebase/auth";
import {
  useState,
  useContext,
  createContext,
  ReactNode,
  SetStateAction,
  Dispatch,
} from "react";

interface UserContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | null>(null);
interface UserProviderProps {
  children: ReactNode;
}
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const initialUserDataJson = localStorage.getItem("userData");
  const initialUserData: User | null = initialUserDataJson
    ? JSON.parse(initialUserDataJson)
    : null;
  const [user, setUser] = useState<User | null>(initialUserData);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// UserContext를 사용하는 커스텀 훅을 생성합니다.
export const useUser = () => {
  return useContext(UserContext);
};

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
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<EntrancePage />} />
            {/* 추후 meet 대신 room_34234 이런식으로 바뀌어야함 */}
            <Route path="/meet" element={<VideoChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
