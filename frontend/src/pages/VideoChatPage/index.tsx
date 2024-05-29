import { useEffect, useRef, useState } from "react";
import { HandleEnterRoomType } from "../../Types";

const VideoChatPage = ({ RN, nickname, socket }: HandleEnterRoomType) => {
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState<
    { nickname: string; message: string }[]
  >([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // 메시지 보내기
  const handleChatSubmit = () => {
    socket.emit("message", message, RN, nickname);
    setMessage("");
  };

  // 메시지 받기
  socket.on("newMessage", (data: { nickname: string; message: string }) => {
    setNewMessages([...newMessages, data]);
  });

  const getMedia = async () => {
    try {
      const myStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log(myStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = myStream;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMedia();
  }, []);

  return (
    <div>
      {`${RN} 방`}
      <br />
      <br />
      {`${nickname} 님`}
      <br />
      <br />
      <br />
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        className="w-96 h-96"
      ></video>
      <br />
      <br />
      <br />
      채팅
      <br />
      {newMessages.map((newMessage, index) => (
        <li
          className={`list-none ${
            newMessage.nickname === nickname ? "bg-green-200" : "bg-blue-400"
          }`}
          key={index}
        >{`${newMessage.nickname === nickname ? "" : newMessage.nickname} : ${
          newMessage.message
        }`}</li>
      ))}
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleChatSubmit}>확인</button>
      </form>
    </div>
  );
};

export default VideoChatPage;
