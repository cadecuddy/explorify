import Image from "next/image";

export default function UnauthedNav() {
  return (
    <div className="text-secondary flex items-center justify-between p-8 sm:mx-auto sm:max-w-6xl">
      <div className="flex items-center text-4xl">
        <Image
          src="note.svg"
          width={45}
          height={45}
          alt="music note"
          className="fill-white"
        />
        <span className="ml-2 font-light">Explorify</span>
      </div>
      <button className="btn btn-outline text-base font-normal">
        Login
        <Image
          src="right.svg"
          width={20}
          height={20}
          alt="arrow"
          className="select-none"
        />
      </button>
    </div>
  );
}
