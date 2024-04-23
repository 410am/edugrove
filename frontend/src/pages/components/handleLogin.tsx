import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  User,
} from "@firebase/auth";
import app from "../firebaseConfig";
import { useState } from "react";

const handleLogin = () => {
  const initialUserDataJson = localStorage.getItem("userData");
  const initialUserData = initialUserDataJson
    ? JSON.parse(initialUserDataJson)
    : {};

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState<User | null>(initialUserData);

  // 로그인, user 정보 가져오기
  const handleAuth = () => {
    signInWithPopup(auth, provider)
      .then((result: UserCredential) => {
        setUser(result.user);
        localStorage?.setItem("userData", JSON.stringify(result.user));
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return { auth, user, setUser, handleAuth };
};
export default handleLogin;
