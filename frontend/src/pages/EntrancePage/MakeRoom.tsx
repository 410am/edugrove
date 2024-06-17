// 회의 만들기(로그인시 추가됨), 회의 참여(회의 id 또는 개인링크 이름 설정, 닉네임 설정
import io, { Socket } from "socket.io-client";
import { ChangeEvent, useEffect, useState } from "react";
import Modal from "react-modal";
import handleLogin from "../components/handleLogin";
import { useRef } from "react";
import VideoChatPage from "../VideoChatPage";
import { HandleLoginReturnType } from "../../Types";
import { DefaultEventsMap } from "@socket.io/component-emitter";

const MakeRoom = () => {
  // 로그인 의견 묻는 모달 오픈 여부
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  // 회의 만들기, 참여하기 방이름 묻는 모달 오픈 여부
  const [RNModalOpen, setRNModalOpen] = useState(false);
  // signin card 숨김여부
  const [signinCardIsOpen, setSigninCardIsOpen] = useState(true);
  const [socket, setSocket] =
    useState<Socket<DefaultEventsMap, DefaultEventsMap>>();

  const { user, handleAuth, handleLogout }: HandleLoginReturnType =
    handleLogin();
  useEffect(() => {
    const newSocket: Socket<DefaultEventsMap, DefaultEventsMap> = io(
      "http://localhost:3000"
    );
    setSocket(newSocket);
  }, []);

  // console.log(socket);
  const [RN, setRN] = useState<string>("");
  const [nickname, setNickname] = useState(
    user?.displayName ? user?.displayName : undefined
  );

  // 모달 닫기
  // 이거 나중에 수정해야될듯
  const closeModal = () => {
    setLoginModalOpen(false);
    setRNModalOpen(false);
  };

  const handleMakeRoom = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e?.preventDefault();
    if (nickname?.trim() === "") {
      alert("닉네임을 입력해주세요.");
    } else if (RN.trim() === "") {
      alert("회의 이름을 입력해주세요.");
    } else {
      socket?.emit("enter_room", RN);
      setRN("");
      closeModal();
      setSigninCardIsOpen(false);
    }
  };

  const modalRef = useRef<HTMLDivElement>(null);

  // 오버레이 클릭 시 모달 닫기
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === modalRef.current) {
      closeModal();
    }
  };

  // 모달 스타일
  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "30%",
      height: "24%",
      backgroundColor: "#003465",
      border: "1px solid #ccc",
      color: "white",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
  };

  // 방 만들기 부분 시작

  // 백엔드 서버로부터 받은 메시지를 처리하는 핸들러
  socket?.on("RN", (RN: string) => {
    setRN(RN);
  });

  // 회의 이름 set
  const handleRNSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    setRN(e.target.value.trim());
  };

  //닉네임 set
  const handleNicknameSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  return (
    <div className="bg-gradient-and-image min-h-screen">
      <div className="pt-24 pb-36 grid justify-items-center min-h-screen">
        {signinCardIsOpen ? (
          <div className="signin_card flex w-[35rem] h-[30rem] mx-0 my-auto rounded-3xl border-solid border-separate border-2 border-gray-300 border-opacity-30 shadow-xl justify-center items-center bg-slate-300 bg-opacity-20">
            <div className="py-5 grid grid-rows-3 items-center text-center">
              <h2
                className="text-slate-100 text-4xl font-semibold"
                style={{ fontFamily: "Jost, sans-serif" }}
              >
                Edugrove
              </h2>
              <div>
                <input
                  className="w-[18rem] mb-6 p-4 rounded-xl bg-fuchsia-800 text-xl text-slate-100 shadow-2xl cursor-pointer hover:bg-slate-100 hover:text-fuchsia-800 hover:font-semibold"
                  type="button"
                  value="회의 참여"
                  onClick={() => setRNModalOpen(true)}
                />
                <input
                  className="w-[18rem]  p-4  rounded-xl text-xl bg-blue-950 text-slate-100 shadow-2xl cursor-pointer  hover:bg-slate-100 hover:text-blue-950 hover:font-semibold"
                  type="button"
                  value="회의 만들기"
                  onClick={() =>
                    //user로 하니 이유는 모르겠지만 동작하지 않아서 user name으로 바꾸니 동작했다
                    user?.displayName
                      ? setRNModalOpen(true)
                      : setLoginModalOpen(true)
                  }
                />
              </div>
              {!user ? (
                <button onClick={() => handleAuth(undefined)}>
                  <div className="grid grid-rows-2 justify-center justify-items-center pt-5">
                    <img
                      src="../public/IMG/google_logo.png"
                      alt="구글로 로그인"
                      className="w-10"
                    />
                    <p className="text-slate-100 pt-2">구글로 로그인</p>
                  </div>
                </button>
              ) : (
                <button onClick={handleLogout}>
                  <p className="text-slate-100 hover:underline">로그아웃</p>
                </button>
              )}
              {/* 로그인 모달 */}
              <Modal
                isOpen={loginModalOpen}
                onRequestClose={closeModal}
                style={modalStyles}
              >
                <div ref={modalRef} onClick={handleOverlayClick}>
                  <h2 className="text-center text-lg font-semibold mt-2">
                    로그인 후 이용 가능합니다.
                  </h2>
                  <p className="text-center text-sm  mt-2">
                    로그인 하시겠습니까?
                  </p>
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => {
                        setLoginModalOpen(false);
                        handleAuth(setRNModalOpen);
                      }}
                      className="bg-green-600 text-slate-50 rounded-sm mx-4 p-2 h-9 w-1/3"
                    >
                      네
                    </button>

                    <button
                      onClick={closeModal}
                      className="bg-red-600 text-slate-50 rounded-sm mx-4 p-2 h-9 w-1/3"
                    >
                      아니요
                    </button>
                  </div>
                </div>
              </Modal>
              {/* 회의 만들기 모달 */}
              <Modal
                isOpen={RNModalOpen}
                onRequestClose={closeModal}
                style={modalStyles}
              >
                <form
                  onSubmit={(e) => {
                    // send 누른 뒤 랜더링 방지
                    e.preventDefault();
                  }}
                >
                  <div>회의 이름</div>
                  <input
                    className="border border-1"
                    type="text"
                    defaultValue={RN}
                    onChange={(e) => {
                      handleRNSubmit(e);
                    }}
                  />
                  <div>회의 참여 닉네임</div>
                  <input
                    className="border border-1"
                    type="text"
                    defaultValue={nickname}
                    onChange={(e) => {
                      handleNicknameSubmit(e);
                    }}
                  />
                  <button
                    type="button"
                    className=" w-full mb-3 p-4 border-gray-300 outline-none rounded box-border border-none text-xl cursor-pointer"
                    id="submit"
                    onClick={(e) => handleMakeRoom(e)}
                  >
                    확인
                  </button>
                </form>
              </Modal>
            </div>
            <div className="actions flex border-t-2 border-solid border-gray-300"></div>
          </div>
        ) : (
          <VideoChatPage
            RN={RN}
            nickname={nickname ? nickname : null}
            socket={socket}
          />
        )}
      </div>
    </div>
  );
};

export default MakeRoom;
