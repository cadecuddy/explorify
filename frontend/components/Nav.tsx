import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import Link from "next/link";

interface NavProps {
  session: Session | null;
}

export default function Nav({ session }: NavProps) {
  return (
    <nav>{session ? <AuthedNav session={session} /> : <UnauthedNav />}</nav>
  );
}

function AuthedNav({ session }: { session: Session }) {
  return (
    <div className="flex items-center justify-between p-8 h-32 text-secondary">
      <Link href="/">
        <div className="flex items-center text-4xl">
          <Image
            src="note.svg"
            width={45}
            height={45}
            alt="music note"
            className="fill-white"
          />
          <span className="ml-2 font-extrabold">EXPLORIFY</span>
        </div>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center border-2 px-2 py-1 rounded-md cursor-pointer hover:cursor-pointer">
            <span className="mr-2 select-none">{session.user?.name}</span>
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={session.user?.image ?? "nah"}
                className="rounded-full w-9 h-9"
              />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36 bg-red-500 transition duration-500">
          <DropdownMenuItem>
            <div
              className="hover:cursor-pointer hover:outline-none hover:ring-0 outline-transparent"
              onClick={() =>
                signOut({
                  callbackUrl: "/",
                })
              }
            >
              Logout
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function UnauthedNav() {
  return (
    <div className="flex items-center justify-between p-8 h-32 text-secondary">
      <Link href="/">
        <div className="flex items-center text-4xl">
          <Image
            src="note.svg"
            width={45}
            height={45}
            alt="music note"
            className="fill-white"
          />
          <span className="ml-2 font-extrabold">EXPLORIFY</span>
        </div>
      </Link>
      <Button
        variant={"ghost"}
        className="text-base font-extrabold"
        onClick={() => signIn("spotify", { callbackUrl: "/search" })}
      >
        LOGIN
      </Button>
    </div>
  );
}
