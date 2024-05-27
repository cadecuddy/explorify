import UnauthedNav from "@/components/UnauthedNav";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-background min-h-screen">
      <UnauthedNav />
      <div className="">
        <h1>Sup cuh i am a test.</h1>
      </div>
    </main>
  );
}
