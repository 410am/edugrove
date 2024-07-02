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
    setRN("");
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
      width: "40%",
      backgroundColor: "#003465",
      border: "1px solid #ccc",
      color: "white",
      borderRadius: "25px",
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

  const handleTitle = (value: string) => {
    setRNModalOpen(true);
    return <div>{`${value}`}</div>;
  };

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
      {signinCardIsOpen ? (
        <div className="pt-24 pb-36 grid justify-items-center min-h-screen">
          <div className="signin_card flex w-[35rem] h-[30rem] mx-0 my-auto rounded-3xl border-solid border-separate border-2 border-gray-300 border-opacity-30 shadow-xl justify-center items-center bg-slate-300 bg-opacity-20">
            <div className="py-5 grid items-end text-center h-full w-full">
              <h2
                className="text-slate-100 text-4xl font-semibold"
                style={{ fontFamily: "Jost, sans-serif" }}
              >
                Edugrove
              </h2>
              <div>
                <input
                  className="w-[18rem] mb-8 p-4 rounded-xl bg-fuchsia-800 text-xl text-slate-100 shadow-2xl cursor-pointer hover:bg-slate-100 hover:text-fuchsia-800 hover:font-semibold"
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
              {
                !user ? (
                  <button
                    onClick={() => handleAuth(undefined)}
                    className="mb-2"
                  >
                    <div className="grid grid-rows-2 justify-center justify-items-center">
                      <img
                        src="../public/IMG/google_logo.png"
                        alt="구글로 로그인"
                        className="w-8"
                      />
                      <p className="text-slate-100 pt-2 text-sm">
                        구글로 로그인
                      </p>
                    </div>
                  </button>
                ) : (
                  <div></div>
                )
                // <button onClick={handleLogout}>
                //   <p className="text-slate-100 hover:underline">로그아웃</p>
                // </button>
              }
              {/* 로그인 모달 */}
              <Modal
                isOpen={loginModalOpen}
                onRequestClose={closeModal}
                style={modalStyles}
              >
                <div
                  className="flex justify-end px-3 text-2xl"
                  onClick={closeModal}
                >
                  x
                </div>
                <div
                  ref={modalRef}
                  onClick={handleOverlayClick}
                  className="p-8"
                >
                  <h2 className="text-center text-lg font-semibold">
                    로그인 후 이용 가능합니다.
                  </h2>
                  <p className="text-center text-sm  mt-2 pb-8">
                    로그인 하시겠습니까?
                  </p>
                  <div className="flex justify-center mt-8 mb-4">
                    <button
                      onClick={() => {
                        setLoginModalOpen(false);
                        handleAuth(setRNModalOpen);
                      }}
                      className="bg-blue-400  bg-opacity-25 hover:bg-green-600 text-slate-50 rounded-lg mx-4 p-2 h-9 w-20 mr-18"
                    >
                      네
                    </button>

                    <button
                      onClick={closeModal}
                      className="bg-blue-400 bg-opacity-25 hover:bg-gray-600 text-slate-50 rounded-lg mx-4 p-2 h-9 w-20"
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
                <div
                  className="flex justify-end px-3 text-2xl"
                  onClick={closeModal}
                >
                  x
                </div>
                {/* <div className="text-2xl flex justify-center p-2 pt-4">
                  회의 참가
                </div> */}
                <form
                  onSubmit={(e) => {
                    // send 누른 뒤 랜더링 방지
                    e.preventDefault();
                  }}
                  className="p-6 grid place-content-center"
                >
                  <div className="mb-10">
                    <div className="py-5 flex justify-end">
                      <div className="pr-4 text-2xl">회의 이름</div>
                      <input
                        className="border border-1 rounded-md pl-2 text-gray-900"
                        type="text"
                        defaultValue={RN}
                        onChange={(e) => {
                          handleRNSubmit(e);
                        }}
                      />
                    </div>

                    <div className="py-5 flex justify-end">
                      <div className="pr-4 text-2xl">닉네임</div>
                      <input
                        className="border border-1 rounded-md pl-2 text-gray-900"
                        type="text"
                        placeholder={nickname}
                        defaultValue={nickname}
                        onChange={(e) => {
                          handleNicknameSubmit(e);
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-4 w-fit translate-x-28 hover:bg-blue-400 hover:bg-opacity-25 border-solid rounded-xl text-2xl cursor-pointer"
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
        </div>
      ) : (
        <VideoChatPage
          RN={RN}
          nickname={nickname ? nickname : null}
          socket={socket}
        />
      )}
    </div>
  );
};

export default MakeRoom;
