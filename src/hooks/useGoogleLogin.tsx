import { GoogleLogin } from "@react-oauth/google";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function GoogleSignIn() {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const token = credentialResponse.credential;

        const res = await fetch(`${BASE_URL}/api/auth/google`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          const data = await res.json();
        
        } else {
          throw new Error("Login Failed");
        }
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}

export default GoogleSignIn;
