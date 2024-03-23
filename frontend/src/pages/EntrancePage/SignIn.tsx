// 구글 로그인, 로그아웃, 로그인상태 기억

const SignIn = () => {
  return (
    <div className="bg-green-700 mt-32 pt-24 pb-36 grid justify-items-center">
      <h1 className="text-slate-50 text-3xl font-bold text-center mb-6">
        로그인
      </h1>
      <div className="signin_card w-125 mx-0 my-auto bg-slate-100 rounded-md text-slate-500 shadow-sm w-1/2">
        <h2 className="p-7 text-center text-lg border-b-2 border-solid border-slate-300">
          Welcome!
        </h2>
        <form className="px-7 py-5">
          <input
            className="w-full mb-3 p-4 border border-solid border-gray-300 outline-none rounded box-border text-sm"
            type="text"
            placeholder="아이디를 입력하세요."
          />
          <input
            className="w-full mb-3 p-4 border border-solid border-gray-300 outline-none rounded box-border text-sm"
            type="password"
            placeholder="비밀번호를 입력하세요."
          />
          <input
            className="w-full mb-3 p-4 border-gray-300 outline-none rounded box-border bg-green-800 border-none text-slate-100 text-xl cursor-pointer"
            type="submit"
            value="로그인"
            onChange={(value) => console.log(value)}
          />
          <p className="text-xs text-green-700 text-center">
            * 비밀번호를 타 사이트와 같이 사용할 경우 도용 위험이 있으니,
            <br />
            정기적으로 비밀번호를 변경하세요!
          </p>
        </form>
        <div className="actions flex border-t-2 border-solid border-slate-300">
          <a
            className="flex-grow text-center p-5 text-stone-600 text-sm border-r-2 border-solid border-slate-300 hover:underline"
            href=""
          >
            회원가입
          </a>
          <a
            className="flex-grow text-center p-5 text-stone-600 text-sm border-r-2 border-solid border-slate-300 hover:underline"
            href=""
          >
            아이디 찾기
          </a>
          <a
            className="flex-grow text-center p-5 text-stone-600 text-sm hover:underline"
            href=""
          >
            비밀번호 찾기
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
