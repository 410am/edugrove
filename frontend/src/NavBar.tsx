import SignIn from "./pages/components/SignIn";
import handleLogin from "../src/pages/components/handleLogin";
import { HandleLoginReturnType } from "./Types";
import { useEffect, useState } from "react";

const NavBar = () => {
  const { user }: HandleLoginReturnType = handleLogin();

  const [bgNavbar, setbgNavbar] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setbgNavbar(true);
    } else {
      setbgNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      {user ? (
        <div
          className={`fixed w-full h-[70px] flex space-between justify-end bg-opacity-55 px-3 ${
            bgNavbar ? "bg-gray-400" : null
          }`}
        >
          <SignIn />
        </div>
      ) : null}
    </div>
  );
};

export default NavBar;
