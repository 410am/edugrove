// 회의 만들기(로그인시 추가됨), 회의 참여(회의 id 또는 개인링크 이름 설정, 닉네임 설정
import io from "socket.io-client";
import { ChangeEvent, useState } from "react";
import Modal from "react-modal";
import handleLogin from "../components/handleLogin";
import { useRef } from "react";

const MakeRoom = () => {
  // 로그인 의견 묻는 모달 오픈 여부
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  // 회의 만들기, 참여하기 방이름 묻는 모달 오픈 여부
  const [RNModalOpen, setRNModalOpen] = useState(false);
  // signin card 숨김여부
  const [signinCardIsOpen, setSigninCardIsOpen] = useState(true);

  const { user, handleAuth }: any = handleLogin();

  const { message, setMessage } = useState("");

  const socket = io("http://localhost:3000");
  console.log(socket);
  const [RN, setRN] = useState("");
  const [nickname, setNickname] = useState("");
  // 회의 만들기
  // const handleMakeRoom = () => {
  //   if (localStorage.getItem("userData")) {
  //     socket.emit("enter_room", RN);
  //     setRN("");
  //   } else {
  //     setLoginModalOpen(true);
  //   }
  // };

  // 모달 닫기
  // 이거 나중에 수정해야될듯
  const closeModal = () => {
    setLoginModalOpen(false);
    setRNModalOpen(false);
  };

  const handleMakeRoom = () => {
    socket.emit("enter_room", RN);
    setRN("");
    closeModal();
    setSigninCardIsOpen(false);
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
      width: "50%",
      height: "24%",
      backgroundColor: "white",
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
  };

  // 방 만들기 부분 시작

  // useEffect(() => {
  // 백엔드 서버로부터 받은 메시지를 처리하는 핸들러
  socket.on("RN", (RN) => {
    setRN(RN);
  });

  // return () => {
  // 컴포넌트가 언마운트될 때 소켓 연결 종료
  // socket.disconnect();
  // };
  // }, []);

  // 회의 이름 set
  const handleRNSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    setRN(e.target.value);
  };

  //닉네임 set
  const handleNicknameSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  // 채팅 메시지 set
  const handleMessageSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  // 채팅 메시지 보내기
  const handleSendMessage = () => {
    socket.emit("chatMessage", message);
  };

  return (
    <div>
      <div className="bg-slate-100 pt-24 pb-36 grid justify-items-center h-screen">
        {signinCardIsOpen ? (
          <div className="signin_card flex w-125 mx-0 my-auto rounded-md border border-solid border-gray-300 shadow-xl w-1/2 justify-center">
            <div className="py-5">
              <input
                className="w-full mb-3 p-4 border-b-2 text-xl cursor-pointer"
                type="button"
                value="회의 참여"
                onClick={() => setRNModalOpen(true)}
              />
              <input
                className="w-full mb-3 p-4 border-gray-300 outline-none rounded box-border border-none text-xl cursor-pointer"
                type="button"
                value="회의 만들기"
                onClick={() => setRNModalOpen(true)}
              />
              {/* 회의 만들기 모달 */}
              {RNModalOpen ? (
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
                      defaultValue={user.displayName}
                      onChange={(e) => {
                        handleNicknameSubmit(e);
                      }}
                    />
                    <button
                      type="button"
                      className=" w-full mb-3 p-4 border-gray-300 outline-none rounded box-border border-none text-xl cursor-pointer"
                      id="submit"
                      // type="submit"
                      onClick={handleMakeRoom}
                    >
                      확인
                    </button>
                  </form>
                </Modal>
              ) : null}
              {/* 로그인 모달 */}
              {loginModalOpen ? (
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
              ) : null}
            </div>
            <div className="actions flex border-t-2 border-solid border-gray-300"></div>
          </div>
        ) : (
          <div>
            {RN}
            <br />
            <br />
            {/* {nickname ? nickname : user.displayName} */}
            {nickname}
            <br />
            <br />
            <br />
            채팅
            <br />
            {message}
            <form action="">
              <input
                className="border border-1"
                type="text"
                onChange={(e) => {
                  handleMessageSubmit(e);
                }}
              />
              <button
                type="button"
                className=" w-full mb-3 p-4 border-gray-300 outline-none rounded box-border border-none text-xl cursor-pointer"
                id="submit"
                onClick={handleSendMessage}
              >
                확인
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeRoom;
