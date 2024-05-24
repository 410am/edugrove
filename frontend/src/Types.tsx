import { User, Auth } from "@firebase/auth";
import { SetStateAction } from "react";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "@socket.io/component-emitter";

export interface HandleLoginReturnType {
  auth: Auth;
  user: SetStateAction<User | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleAuth: (
    f: React.Dispatch<React.SetStateAction<boolean>> | undefined
  ) => void;
}

export interface HandleEnterRoomType {
  RN: SetStateAction<string | null>;
  nickname: SetStateAction<string | null>;
  // 소켓타입에러 해결하기
  socket: any;
}
