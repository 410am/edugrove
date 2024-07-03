import { ChangeEvent, useEffect, useRef, useState } from "react";
import { HandleEnterRoomType, HandleLoginReturnType } from "../../Types";
import handleLogin from "../components/handleLogin";

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

  const { user, handleAuth }: HandleLoginReturnType = handleLogin();

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

  //   return (
  //     <div className="h-screen overflow-hidden">
  //       <div className="text-3xl text-stone-800 border-2 border-solid bg-slate-300 bg-opacity-40 border-gray-300 border-opacity-30 w-fit px-12 py-3 rounded-b-3xl flex justify-center mx-14">{`${RN}`}</div>
  //       <br />
  //       {/* <br />
  //     {`${nickname} 님`}
  //     <br />
  //     <br /> */}
  //       {/* peer's stream */}
  //       <div className="relative w-full overflow-hidden h-2/3 flex justify-center mb-6 mt-3">
  //         <video
  //           className="absolute w-10/12 object-center object-cover"
  //           // ref={peerVideoRef}
  //           ref={localVideoRef}
  //           autoPlay
  //           playsInline
  //         ></video>
  //         <div className="bg-red-400 h-40 w-60 self-end absolute right-[7.5rem] overflow-hidden">
  //           <video ref={localVideoRef} autoPlay playsInline></video>
  //         </div>
  //       </div>
  //       {/* <br />
  //         peer's stream */}
  //       <video
  //         ref={peerVideoRef}
  //         autoPlay
  //         playsInline
  //         className="w-96 h-96"
  //       ></video>
  //       <br />
  //       my stream
  //       <video
  //         ref={localVideoRef}
  //         autoPlay
  //         playsInline
  //         className="w-96 h-96"
  //       ></video>
  //       <button onClick={handleMuteClick}>{mute ? "mute" : "unmute"}</button>
  //       {/* 사운드 옵션 */}
  //       {/* <button onClick={handleMuteClick}>{mute ? "mute" : "unmute"}</button>
  //     <button onClick={handleVideoClick}>
  //       {blind ? "비디오 끄기" : "비디오 켜기"}
  //     </button>
  //     <select onChange={cameraSelectHandler}>
  //     </button> */}
  //       {/* 카메라 선택 */}
  //       {/* <select onChange={cameraSelectHandler}>
  //       {cameras?.map((camera) => (
  //         <option key={camera.deviceId} value={camera.deviceId}>
  //           {camera.label}
  //         </option>
  //       ))}
  //     </select>
  //     <br />
  //     <br />
  //     <br />
  //     채팅
  //     <br />
  //     </select> */}
  //       <div className="w-full flex justify-center">
  //         <div className="text-3xl text-stone-800 border-solid bg-slate-300 bg-opacity-40 border-gray-300 border-opacity-30 border-2 w-5/6 py-2 rounded-t-full flex justify-center h-30">
  //           <button className="w-24 text-lg mx-6 grid grid-rows-2 justify-items-center h-fit m-2 translate-x-20">
  //             <img className="w-10 m-1" src="../public/IMG/mic.png" alt="mute" />
  //             {mute ? "음소거 해제" : "음소거"}
  //           </button>
  //           <button className="w-24 text-lg mx-6 grid grid-rows-2 justify-items-center h-fit m-2 translate-x-20">
  //             <img
  //               className="w-10 m-1"
  //               src="../public/IMG/video.png"
  //               alt="video"
  //             />
  //             {blind ? "카메라 켜기" : "카메라 끄기"}
  //           </button>
  //           <button className="w-24 text-lg mx-6 grid grid-rows-2 justify-items-center h-fit m-2 translate-x-20">
  //             <img className="w-10 m-1" src="../public/IMG/chat.png" alt="chat" />
  //             채팅
  //           </button>
  //           <button className="w-24 text-lg mx-6 grid grid-rows-2 justify-items-center h-fit m-2 translate-x-20">
  //             <img
  //               className="w-10 m-1"
  //               src="../public/IMG/screen_share.png"
  //               alt="screen share"
  //             />
  //             화면 공유
  //           </button>
  //           <button className="w-24 text-lg mx-6 grid grid-rows-2 justify-items-center h-fit m-2 translate-x-44">
  //             <img
  //               className="w-10 m-1"
  //               src="../public/IMG/logout.png"
  //               alt="mute"
  //             />
  //             나가기
  //           </button>
  //         </div>
  //       </div>
  //       {/* 채팅 */}
  //       {/* <br />
  //     {newMessages.map((newMessage, index) => (
  //       <li
  //         className={`list-none ${
  // @@ -238,7 +272,7 @@ const VideoCall = ({ RN, nickname, socket }: HandleEnterRoomType) => {
  //         onChange={(e) => setMessage(e.target.value)}
  //       />
  //       <button onClick={handleChatSubmit}>확인</button>
  //     </form>
  //     </form> */}
  //     </div>
  // );

  return (
    <div className="h-screen overflow-hidden">
      <div className="text-3xl text-stone-800 border-2 border-solid bg-slate-300 bg-opacity-40 border-gray-300 border-opacity-30 w-fit px-12 py-3 rounded-b-3xl flex justify-center mx-14">{`${RN}`}</div>
      {/* {`${nickname} 님`} */}
      {/* peer's stream */}
      <div className="relative w-full overflow-hidden h-[36rem] flex justify-center mb-1">
        <video
          className="absolute w-[65rem] object-center object-cover"
          // ref={peerVideoRef}
          ref={localVideoRef}
          autoPlay
          playsInline
        ></video>
        <div className=" h-40 w-[65rem] self-end absolute overflow-hidden grid justify-end">
          <video
            className="w-60"
            ref={localVideoRef}
            autoPlay
            playsInline
          ></video>
        </div>
      </div>

      {/* 사운드 옵션 */}
      {/* <button onClick={handleMuteClick}>{mute ? "mute" : "unmute"}</button>
      <button onClick={handleVideoClick}>
        {blind ? "비디오 끄기" : "비디오 켜기"}
      </button>
      <select onChange={cameraSelectHandler}>
      </button> */}
      {/* 카메라 선택 */}
      {/* <select onChange={cameraSelectHandler}>
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
      </select> */}
      <div className="w-full flex justify-center">
        <div className="text-3xl text-slate-100 border-solid bg-slate-300 bg-opacity-40 border-gray-300 border-opacity-30 border-2 w-5/6 py-2 rounded-t-full flex justify-center h-52">
          {!user ? (
            <button
              onClick={() => handleAuth(undefined)}
              className="mb-20 -translate-x-20"
            >
              <div className="flex items-center ">
                <img
                  src="../public/IMG/google_logo.png"
                  alt="구글로 로그인"
                  className="w-8"
                />
                <p className="text-slate-100 text-lg  m-3">구글로 로그인</p>
              </div>
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={handleMuteClick}
            className="w-24 text-lg mx-4 grid grid-rows-2 justify-items-center h-fit m-2 "
          >
            {mute ? (
              <img
                className="w-10 m-1"
                src="../public/IMG/mic.png"
                alt="mute"
              />
            ) : (
              <img
                className="w-10 m-1"
                src="../public/IMG/mic_off.png"
                alt="unmute"
              />
            )}
            {mute ? "음소거" : "음소거 해제"}
          </button>
          <button
            onClick={handleVideoClick}
            className="w-24 text-lg mx-4 grid grid-rows-2 justify-items-center h-fit m-2 "
          >
            {blind ? (
              <img
                className="w-10 m-1"
                src="../public/IMG/video.png"
                alt="video"
              />
            ) : (
              <img
                className="w-10 m-1"
                src="../public/IMG/video_off.png"
                alt="video"
              />
            )}
            {blind ? "카메라 끄기" : "카메라 켜기"}
          </button>
          <button className="w-24 text-lg mx-4 grid grid-rows-2 justify-items-center h-fit m-2 ">
            <img className="w-10 m-1" src="../public/IMG/chat.png" alt="chat" />
            채팅
          </button>
          <button className="w-24 text-lg mx-4 grid grid-rows-2 justify-items-center h-fit m-2 ">
            <img
              className="w-10 m-1"
              src="../public/IMG/screen_share.png"
              alt="screen share"
            />
            화면 공유
          </button>
          <button className="w-24 text-lg mx-4 grid grid-rows-2 justify-items-center h-fit m-2 translate-x-20">
            <img
              className="w-10 m-1"
              src="../public/IMG/logout.png"
              alt="mute"
            />
            나가기
          </button>
        </div>
      </div>
      {/* 채팅 */}
      {/* <br />
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
      </form> */}
    </div>
  );
};

export default VideoCall;
