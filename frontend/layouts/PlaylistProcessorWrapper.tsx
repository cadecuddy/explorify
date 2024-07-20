import Footer from "@/components/Footer";
import MetaHeader from "@/components/MetaHeader";
import Nav from "@/components/Nav";
import { checkLocalStorage } from "@/components/Utils";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ReactNode, useEffect } from "react";

type PlaylistProcessorProps = {
  children: ReactNode;
};

/**
 * Wrapper containing logic to process authed user's
 * public playlists if they haven't been already.
 *
 * Also acts as an auth wrapper, redirecting to the home
 * page if the session or access token doesn't exist.
 */
export default function PlaylistProcessorWrapper({
  children,
}: PlaylistProcessorProps) {
  const { data: session } = useSession();

  if (!session) {
    redirect("/");
  }

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

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <Nav session={session} />
        {children}
      </div>
    </>
  );
}
