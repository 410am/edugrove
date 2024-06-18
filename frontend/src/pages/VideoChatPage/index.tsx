import VideoCall from "./videoCall";
import { HandleEnterRoomType } from "../../Types";

const VideoChatPage = ({ RN, nickname, socket }: HandleEnterRoomType) => {
  return (
    <div>
      <VideoCall
        RN={RN}
        nickname={nickname ? nickname : null}
        socket={socket}
      />
    </div>
  );
};

export default VideoChatPage;
