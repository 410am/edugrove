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
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  // Stream
  const getMedia = async (deviceId?: string) => {
    const initialConstraints = {
      // audio: true,
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
      console.log("1번 완료");
    } catch (error) {
      console.log(error);
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

  const makeConnection = () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            // "stun:stun1.l.google.com:19302",
            // "stun:stun2.l.google.com:19302",
            // "stun:stun3.l.google.com:19302",
            // "stun:stun4.l.google.com:19302",
          ],
        },
      ],
    });
    const myStream = myStreamRef.current;
    myStream
      ?.getTracks()
      // 2. addTrack(addStream)
      .forEach((track) => peerConnection.addTrack(track, myStream));
    peerConnectionRef.current = peerConnection;
    peerConnection.addEventListener("track", handleTrackEvent);
    peerConnection.addEventListener("icecandidate", handleIce);
    if (peerConnection) console.log("2번 성공", peerConnection);
  };

  const initCall = async () => {
    await getMedia();
    makeConnection();
  };

  const handleTrackEvent = (event: RTCTrackEvent) => {
    console.log(event.streams[0]);
    if (peerVideoRef.current) {
      peerVideoRef.current.srcObject = event.streams[0];
    }
  };

  const handleIce = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      socket.emit("ice", event.candidate, RN);
      console.log("got ice candidate");
      console.log(event.candidate);
    }
  };

  useEffect(() => {
    initCall();
  }, []);

  // peer B
  socket.on("offer", async (offer: RTCSessionDescription) => {
    console.log("Received offer", offer);
    if (!peerConnectionRef.current) {
      await initCall();
    }
    console.log(offer);
    console.log(peerConnectionRef);
    if (peerConnectionRef.current?.signalingState !== "stable") return;
    // 6. setRemoteDescription
    await peerConnectionRef.current.setRemoteDescription(offer);
    console.log("6번 :", peerConnectionRef.current);

    // 7. createAnswer
    const answer = await peerConnectionRef.current.createAnswer();
    console.log("7. answer", answer);
    await peerConnectionRef.current.setLocalDescription(answer);

    socket.emit("answer", answer, RN);
  });

  // peer A
  socket.on("welcome", async () => {
    if (
      !peerConnectionRef.current ||
      peerConnectionRef.current.signalingState !== "stable"
    )
      return;

    if (peerConnectionRef.current.localDescription) return;
    // 3. create offer
    const offer = await peerConnectionRef.current.createOffer();
    if (offer) console.log("3번 성공", offer);

    //  4. setLocalDescription
    await peerConnectionRef.current.setLocalDescription(offer);
    console.log("4번 성공");

    //   5. send offer
    await socket.emit("offer", offer, RN);
    console.log("5번 성공");
  });

  socket.on("answer", async (answer: RTCSessionDescription) => {
    if (!peerConnectionRef.current) return;
    console.log("answer 받음", peerConnectionRef.current);
    await peerConnectionRef.current.setRemoteDescription(answer);
    console.log(peerConnectionRef.current.remoteDescription);
  });

  socket.on("ice", async (ice: RTCIceCandidateInit) => {
    if (
      !peerConnectionRef.current ||
      !peerConnectionRef.current.remoteDescription
    )
      return;
    if (peerConnectionRef.current.signalingState !== "stable") return;
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

  // 카메라 선택하기
  const cameraSelectHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    await getMedia(e.target.value);
    if (peerConnectionRef.current) {
      // for my stream
      const videoTrack = myStreamRef.current?.getVideoTracks()[0];
      const videoSender = peerConnectionRef.current
        .getSenders()
        .find((sender) => sender.track?.kind === "video");
      videoSender?.replaceTrack(videoTrack ? videoTrack : null);
    }
  };
  // 화면 공유 시작
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // 대부분의 브라우저는 화면 공유 시 오디오를 지원하지 않습니다.
      });
      return stream;
    } catch (error) {
      console.error("Error sharing screen:", error);
      return null;
    }
  };

  const handleScreenShare = async () => {
    const screenStream = await startScreenShare();
    if (screenStream && peerConnectionRef.current) {
      // 화면 공유 트랙을 screenTrackRef에 저장
      screenTrackRef.current = screenStream.getVideoTracks()[0];

      // 기존 트랙 제거 및 화면 공유 트랙 추가
      peerConnectionRef.current.getSenders().forEach((sender: RTCRtpSender) => {
        if (sender.track?.kind === "video") {
          sender.replaceTrack(screenTrackRef.current);
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
    }
  };

  // 화면 공유 중지
  const stopScreenShare = async () => {
    console.log("stopScreenShare 호출됨");
    if (screenTrackRef.current) {
      console.log("화면 공유 트랙 중지");
      screenTrackRef.current.stop();

      console.log("카메라 스트림 가져오기");
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const cameraTrack = cameraStream.getVideoTracks()[0];
      console.log("트랙 교체, 카메라 트랙:", cameraTrack);

      const sender = peerConnectionRef.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) {
        console.log("트랙 교체, sender:", sender);
        sender.replaceTrack(cameraTrack);
      }
      getMedia();
      screenTrackRef.current = null;
      console.log("화면 공유 트랙 중지 및 교체 완료");
    } else {
      console.log("중지할 화면 공유 트랙이 없음");
    }
  };

  return (
    <div className="bg-gradient">
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
      <button onClick={handleScreenShare}>Start Screen Share</button>
      <button onClick={stopScreenShare}>Stop Screen Share</button>
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
