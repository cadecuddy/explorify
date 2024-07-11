import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-white text-center font-extrabold text-2xl">
        <Button
          variant={"ghost"}
          className="text-2xl font-extrabold px-4 py-8"
          onClick={() => signIn("spotify", { callbackUrl: "/search" })}
        >
          SIGN IN WITH SPOTIFY
        </Button>
      </div>
    </main>
  );
}
