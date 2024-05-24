import { User } from "@firebase/auth";

import {
  useState,
  useContext,
  createContext,
  ReactNode,
  SetStateAction,
  Dispatch,
} from "react";

interface UserContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | null>(null);
interface UserProviderProps {
  children: ReactNode;
}
const UserProvider: React.FC<UserProviderProps> = ({
  children,
}: {
  children: ReactNode;
}) => {
  const initialUserDataJson = localStorage.getItem("userData");
  const initialUserData: User | null = initialUserDataJson
    ? JSON.parse(initialUserDataJson)
    : null;
  const [user, setUser] = useState<User | null>(initialUserData);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// UserContext를 사용하는 커스텀 훅을 생성합니다.
const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser는 UserProvider 내에서 사용 가능합니다.");
  }
  return context;
};

export { UserProvider, useUser };
