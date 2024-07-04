// 구글 로그인, 로그아웃, 로그인상태 기억
import { onAuthStateChanged } from "@firebase/auth";
import handleLogin from "./handleLogin";
import { SetStateAction, useEffect } from "react";
import { User } from "@firebase/auth";
import { HandleLoginReturnType } from "../../Types";

const SignIn = () => {
  const {
    auth,
    user,
    setUser,
    handleAuth,
    handleLogout,
  }: HandleLoginReturnType = handleLogin();

  // 이해 안되는 부분
  useEffect(() => {
    // 사용자 인증 상태 변경을 확인하고 사용자 정보 업데이트
    const unsubscribe = onAuthStateChanged(
      auth,
      (user: SetStateAction<User | null>) => {
        setUser(user);
      }
    );

    // Clean-up 함수
    return () => unsubscribe();
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행
  // 이해 안되는 부분

  return (
    <div className="flex items-center justify-center">
      {/* 유저 프로필 사진 */}
      {user?.photoURL && (
        <div className="group">
          <img
            className="h-14 rounded-full p-2 mr-3"
            src={user.photoURL}
            alt="user photo"
          />
          <input
            className="hidden group-hover:block absolute p-1 -translate-x-2 hover:bg-slate-100 hover:text-slate-950 text-slate-50 hover:border-transparent cursor-pointer border border-solid border-slate-300 rounded"
            type="button"
            value="로그아웃"
            onClick={handleLogout}
          />
        </div>
      )}
      {/* 로그인, 로그아웃 */}
      {!user ? (
        <input
          className="h-2/3 hover:bg-slate-100 hover:text-slate-950 text-slate-50 bg-slate-700 hover:border-transparent cursor-pointer tracking-widest p-2 uppercase border border-solid border-slate-300 rounded"
          type="button"
          value="구글로 로그인"
          // handleAuth에 undefined라도 넣어야하는거 해결해야할듯
          onClick={() => handleAuth(undefined)}
        />
      ) : // <input
      //   className="h-2/3 hover:bg-slate-100 hover:text-slate-950 text-slate-50 bg-slate-700 hover:border-transparent cursor-pointer tracking-widest p-2 uppercase border border-solid border-slate-300 rounded"
      //   type="button"
      //   value="로그아웃"
      //   onClick={handleLogout}
      // />
      null}
    </div>
  );
};
export default SignIn;
