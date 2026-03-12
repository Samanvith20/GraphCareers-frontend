import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function GoogleSignInButton() {
  const navigate = useNavigate();

  return (
    <div className="w-full [&>div]:!w-full [&>div>div]:!w-full [&_iframe]:!w-full">
      <GoogleLogin
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        width="400"
        useOneTap={false}
        onSuccess={async (credentialResponse) => {
          try {
            const res = await fetch(`${BASE_URL}/api/auth/google`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: credentialResponse.credential }),
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
        onError={() => toast.error("Google login failed")}
      />
    </div>
  );
}

export default GoogleSignInButton;