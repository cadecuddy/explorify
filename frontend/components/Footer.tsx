import Link from "next/link";

export default function Footer() {
  return (
    <div className="relative w-full p-4 hidden sm:block font-extralight z-10">
      <p className="text-white text-right">
        by{" "}
        <Link
          href="https://cade.fyi/"
          target="_blank"
          className="hover:text-blue-400"
        >
          cade cuddy
        </Link>
      </p>
    </div>
  );
}
