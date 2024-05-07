// 회의 만들기(로그인시 추가됨), 회의 참여(회의 id 또는 개인링크 이름 설정, 닉네임 설정
import { useState } from "react";
import Modal from "react-modal";
import handleLogin from "../components/handleLogin";
import { useRef } from "react";

const MakeRoom = () => {
  // 로그인 의견 묻는 모달 오픈 여부
  const [open, setOpen] = useState(false);
  // 회의 입장하기
  const handleEnterRoom = () => {};

  const { handleAuth }: any = handleLogin();

  // 회의 만들기
  const handleMakeRoom = () => {
    if (localStorage.getItem("userData")) {
      alert("회의 만들기 가능");
    } else {
      setOpen(true);
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setOpen(false);
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

  return (
    <div className="bg-slate-100 pt-24 pb-36 grid justify-items-center h-screen">
      <div className="signin_card flex w-125 mx-0 my-auto rounded-md border border-solid border-gray-300 shadow-xl w-1/2 justify-center">
        <form className="py-5">
          <input
            className="w-full mb-3 p-4 border-b-2 text-xl cursor-pointer"
            type="button"
            value="회의 참여"
            onClick={handleEnterRoom}
          />
          <input
            className="w-full mb-3 p-4 border-gray-300 outline-none rounded box-border border-none text-xl cursor-pointer"
            type="button"
            value="회의 만들기"
            onClick={handleMakeRoom}
          />
          {open ? (
            <Modal
              isOpen={open}
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
                      setOpen(false);
                      handleAuth();
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
        </form>
        <div className="actions flex border-t-2 border-solid border-gray-300"></div>
      </div>
    </div>
  );
};

export default MakeRoom;
