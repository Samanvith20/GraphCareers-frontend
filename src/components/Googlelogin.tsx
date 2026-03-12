import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function GoogleSignInButton() {
  const navigate = useNavigate();

  return (
    <GoogleLogin
      theme="outline"
      size="large"
      text="signin_with"
      shape="rectangular"
      width="100%"
      useOneTap={false}

      onSuccess={async (credentialResponse) => {
        try {
          const token = credentialResponse.credential;

          const res = await fetch(`${BASE_URL}/api/auth/google`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          const data = await res.json();

          if (data.error) {
            toast.error("Google login failed");
            return;
          }

          toast.success("Login successful");
          navigate("/profile");

        } catch {
          toast.error("Google login failed");
        }
      }}

      onError={() => {
        toast.error("Google login failed");
      }}
    />
  );
}

export default GoogleSignInButton;