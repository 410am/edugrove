import {
  ChangeEvent,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  SetStateAction,
  useState,
} from "react";
import MakeRoom from "../EntrancePage/MakeRoom";
import { HandleEnterRoomType } from "../../Types";

const VideoChatPage = ({ RN, nickname, socket }: HandleEnterRoomType) => {
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages]: any = useState([]);
  const [messageNickname, setMessageNickname] = useState("");

  // // 채팅 메시지 set
  // const handleMessageSubmit = (e: ChangeEvent<HTMLInputElement>) => {
  //   setMessage(e.target.value);
  // };

  // // 채팅 메시지 보내기
  // const handleSendMessage = () => {
  //   socket.emit("chatMessage", message);
  //   socket.on("message", (nm: SetStateAction<string>) => setNewMessage(nm));
  // };

  const handleChatSubmit = () => {
    socket.emit("messages", message, nickname);
    socket.on("newMessage", (nm: string, nn: string) => {
      setNewMessages([...newMessages, nm]);
      console.log(newMessages);
      setMessageNickname(nn);
    });
    setMessage("");
  };

  return (
    <div>
      {`${RN} 방`}
      <br />
      <br />
      {`${nickname} 님`}
      <br />
      <br />
      <br />
      채팅
      <br />
      {`${messageNickname} : `}
      {newMessages.map(
        (newMessage: string | undefined, index: Key | null | undefined) => (
          <li className="list-none" key={index}>
            {newMessage}
          </li>
        )
      )}
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
