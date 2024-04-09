import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";

const GoogleLoginButton = () => {
  const clientId =
    "992704487053-45ecc7r7t8emq144d9lb1daeghvp2h6h.apps.googleusercontent.com";

  //test
  const sendRequest = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/test", {
        message: "Hello from frontend",
      });
      console.log("Response from backend:", response.data);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  sendRequest();
  //test

  return (
    <>
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin
          onSuccess={(res) => {
            console.log(res);
          }}
        />
      </GoogleOAuthProvider>
    </>
  );
};

export default GoogleLoginButton;
