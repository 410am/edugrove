import { ChangeEvent, useEffect, useRef, useState } from "react";
import { HandleEnterRoomType } from "../../Types";

const VideoChatPage = ({ RN, nickname, socket }: HandleEnterRoomType) => {
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState<
    { nickname: string; message: string }[]
  >([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const myStreamRef = useRef<MediaStream | null>(null);
  const [mute, setMute] = useState<boolean>(true);
  const [blind, setBlind] = useState<boolean>(true);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>();

  // 메시지 보내기
  const handleChatSubmit = () => {
    socket.emit("message", message, RN, nickname);
    setMessage("");
  };

  // 메시지 받기
  socket.on("newMessage", (data: { nickname: string; message: string }) => {
    setNewMessages([...newMessages, data]);
  });

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((device) => device.kind === "videoinput"));
    } catch (error) {
      console.log(error);
    }
  };
  // Stream
  const getMedia = async (deviceId: any) => {
    const initialConstrains = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    try {
      const myStream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstrains : initialConstrains
      );
      myStreamRef.current = myStream;
      if (!deviceId) {
        await getCameras();
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = myStream;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMedia(undefined);
  }, []);

  // 내 소리 mute 하기
  const handleMuteClick = () => {
    if (myStreamRef.current) {
      myStreamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setMute(myStreamRef.current?.getAudioTracks()[0].enabled);
    }
  };

  // 내 영상 끄기
  const handleVideoClick = () => {
    if (myStreamRef.current) {
      myStreamRef.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setBlind(myStreamRef.current?.getVideoTracks()[0].enabled);
    }
  };

  const cameraSelectHandler = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    console.log(e);
    await getMedia(e);
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
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        className="w-96 h-96"
      ></video>
      <button onClick={handleMuteClick}>{mute ? "mute" : "unmute"}</button>
      <button onClick={handleVideoClick}>
        {blind ? "비디오 끄기" : "비디오 켜기"}
      </button>
      <select onChange={cameraSelectHandler}>
        {cameras?.map((camera) => (
          <option key={camera.deviceId} value={camera.label}>
            {camera.label}
          </option>
        ))}
      </select>
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
