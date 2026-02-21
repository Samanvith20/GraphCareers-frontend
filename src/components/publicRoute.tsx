
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function PublicRoute({ children }: { children: JSX.Element }) {
  const { data, isLoading } = useAuth();

   if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

  if (data?.user) {
    return <Navigate to="/jobs" replace />;
  }

  return children;
}