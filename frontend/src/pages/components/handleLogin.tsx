import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  User,
} from "@firebase/auth";
import app from "../firebaseConfig";
import { useState } from "react";
import { useUser } from "../../App";

const handleLogin = () => {
  // const initialUserDataJson = localStorage.getItem("userData");
  // const initialUserData = initialUserDataJson
  //   ? JSON.parse(initialUserDataJson)
  //   : {};

  const { user, setUser } = useUser();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  // const [user, setUser] = useState<User | null>(initialUserData);
  console.log(user);

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
  return { auth, user, setUser, handleAuth };
};
export default handleLogin;
