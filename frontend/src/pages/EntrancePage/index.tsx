import SignIn from "./SignIn";
import GoogleLoginButton from "./gg";

const EntrancePage = () => {
  // 1. 로그인
  // 2. 회의 참가
  // 3. 회의 만들기
  // 2,3번 묶으면 될듯

  return (
    <div>
      {/* <div>머여</div> */}
      {/* <div className="font-['Nanum Gothic']">된건가</div> */}
      {/* <div className="material-icons text-xs">upload</div> */}
      <SignIn />
      <GoogleLoginButton />
    </div>
  );
};

export default EntrancePage;
