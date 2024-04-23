// 방 만들기, 방 들어가기
import { useState } from "react";
import Modal from "react-responsive-modal";
import handleAuth from "../components/handleLogin";
import handleLogin from "../components/handleLogin";

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

  const closeModal = () => {
    setOpen(false);
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
              open={open}
              onClose={closeModal}
              closeOnOverlayClick={true}
              center
              showCloseIcon={false}
              styles={{
                overlay: {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
                modal: {
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "white",
                  maxWidth: "400px", // 모달 최대 너비
                  width: "90%", // 모달 너비
                },
              }}
            >
              <h2 className="text-center text-lg font-semibold m-1 mt-8">
                로그인 후 이용 가능합니다.
              </h2>
              <p className="text-center text-sm m-1 mt-2 mb-9">
                로그인 하시겠습니까?
              </p>
              <div className="flex justify-center mt-7 mb-6">
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
            </Modal>
          ) : null}
        </form>
        <div className="actions flex border-t-2 border-solid border-gray-300"></div>
      </div>
    </div>
  );
};

export default MakeRoom;
