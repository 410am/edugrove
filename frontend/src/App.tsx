import { BrowserRouter, Route, Routes } from "react-router-dom";
import EntrancePage from "./pages/EntrancePage";
import VideoChatPage from "./pages/VideoChatPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<EntrancePage />} />
        <Route path="/meet" element={<VideoChatPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
