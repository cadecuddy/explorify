import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { checkLocalStorage } from "./Utils";

export default function AuthedLanding() {
  const { data: session } = useSession();

  useEffect(() => {
    const sendPlaylists = checkLocalStorage();

    if (session && session.accessToken && sendPlaylists) {
      fetch("/api/playlist/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session }),
      });
    }
  }, []);

  return <div>search</div>;
}
