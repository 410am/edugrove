import { ChangeEvent, useEffect, useRef, useState } from "react";
import { HandleEnterRoomType } from "../../Types";

const VideoCall = ({ RN, nickname, socket }: HandleEnterRoomType) => {
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState<
    { nickname: string; message: string }[]
  >([]);
  const peerVideoRef = useRef<HTMLVideoElement>(null);
  const [mute, setMute] = useState<boolean>(true);
  const [blind, setBlind] = useState<boolean>(true);
  const myStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Stream
  const getMedia = async (deviceId?: string) => {
    const initialConstraints = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints = {
      audio: true,
      video: { deviceId: deviceId ? { exact: deviceId } : undefined },
    };
    try {
      // 1. getUserMedia (peer A)
      const myStream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstraints
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

  const makeConnection = async () => {
    const peerConnection = new RTCPeerConnection();
    const myStream = myStreamRef.current;
    myStream
      ?.getTracks()
      // 2. addTrack(addStream)
      .forEach((track) => peerConnection.addTrack(track, myStream));
    peerConnectionRef.current = peerConnection;
    peerConnection.addEventListener("icecandidate", handleIce);
    peerConnection.addEventListener("track", handleTrackEvent);
  };

  const handleTrackEvent = (event: RTCTrackEvent) => {
    console.log(event.streams[0]);
    if (peerVideoRef.current) {
      peerVideoRef.current.srcObject = event.streams[0];
    }
  };

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((device) => device.kind === "videoinput"));
    } catch (error) {
      console.log(error);
    }
  };

  const initCall = async () => {
    await getMedia();
    makeConnection();
  };

  useEffect(() => {
    initCall();
  }, []);

  // peer A
  socket.on("welcome", async () => {
    if (
      !peerConnectionRef.current ||
      peerConnectionRef.current.signalingState !== "stable"
    )
      return;
    // 3. create offer
    const offer = await peerConnectionRef.current.createOffer();
    //  4. setLocalDescription
    await peerConnectionRef.current.setLocalDescription(offer);
    console.log("sent the offer");
    console.log(offer);
    // 5. send offer
    socket.emit("offer", offer, RN);
  });

  // peer B
  socket.on("offer", async (offer: RTCSessionDescription) => {
    await initCall();
    console.log(offer);
    console.log(peerConnectionRef);
    if (!peerConnectionRef.current) return;
    // 6. setRemoteDescription
    await peerConnectionRef.current.setRemoteDescription(offer);
    console.log(peerConnectionRef.current);

    // 7. createAnswer
    const answer = await peerConnectionRef.current?.createAnswer();
    console.log("7. answer", answer);
    peerConnectionRef.current?.setLocalDescription(answer);
    socket.emit("answer", answer, RN);
  });

  socket.on("answer", async (answer: RTCSessionDescription) => {
    if (!peerConnectionRef.current) return;
    console.log("answer 받음", answer);
    // 여기서 뭐 문제 있었고 Uncaught (in promise) DOMException: Cannot set remote answer in state stable
    await peerConnectionRef.current?.setRemoteDescription(answer);
  });

  //   socket.on("offer", async (offer: RTCSessionDescription) => {
  //     peerConnection?.setRemoteDescription(offer);
  //     const answer = await peerConnection?.createAnswer();
  //     peerConnection?.setLocalDescription(answer);
  //     socket.emit("answer", answer, RN);
  //   });

  //   socket.on("answer", (answer: RTCSessionDescription) => {
  //     peerConnection?.setRemoteDescription(answer);
  //   });

  const handleIce = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      socket.emit("ice", event.candidate, RN);
      console.log("got ice candidate");
      console.log(event.candidate);
    }
  };

  socket.on("ice", async (ice: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(ice));
    console.log("got ice candidate!!");
  });

  // 메시지 보내기
  const handleChatSubmit = () => {
    socket.emit("message", message, RN, nickname);
    setMessage("");
  };

  // 메시지 받기
  socket.on("newMessage", (data: { nickname: string; message: string }) => {
    setNewMessages([...newMessages, data]);
  });

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

  const cameraSelectHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    console.log(e);
    await getMedia(e.target.value);
  };

  return (
    <div>
      {`${RN} 방`}
      <br />
      <br />
      {`${nickname} 님`}
      <br />
      <br />
      peer's stream
      <video
        ref={peerVideoRef}
        autoPlay
        playsInline
        className="w-96 h-96"
      ></video>
      <br />
      my stream
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
          <option key={camera.deviceId} value={camera.deviceId}>
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

export default VideoCall;
