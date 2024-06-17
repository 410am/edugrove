import SignIn from "./pages/components/SignIn";

const NavBar = () => {
  return (
    <div className="fixed w-full h-[70px] flex space-between justify-end px-3 bg-cyan-800">
      <SignIn />
    </div>
  );
};

export default NavBar;
