import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from "@firebase/auth";
import app from "../firebaseConfig";
import { useUser } from "../../UserContext";
import { signOut } from "@firebase/auth";

const handleLogin = () => {
  const { user, setUser } = useUser();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  // console.log(user);

  // 로그인, user 정보 가져오기
  const handleAuth = (
    f: React.Dispatch<React.SetStateAction<boolean>> | undefined
  ) => {
    signInWithPopup(auth, provider)
      .then((result: UserCredential) => {
        setUser(result.user);
        localStorage?.setItem("userData", JSON.stringify(result.user));
        // setRNModalOpen 등의 함수 콜백
        return f ? f(true) : null;
      })
      .catch((error) => {
        console.error(error);
      });
  };
  // 로그아웃
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        localStorage.clear();
        console.log(user);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return { auth, user, setUser, handleAuth, handleLogout };
};
export default handleLogin;
