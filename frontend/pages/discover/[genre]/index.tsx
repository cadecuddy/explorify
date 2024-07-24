import MainLayout from "@/layouts/MainLayout";
import PlaylistProcessorWrapper from "@/layouts/PlaylistProcessorWrapper";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const genre = router.query.genre as string;

  return (
    <MainLayout
      description="Find your next favorite playlist based on songs you love"
      title="search / explorify"
    >
      <PlaylistProcessorWrapper>
        <div className="justify-center text-center">
          <h1 className="text-3xl sm:text-7xl font-extrabold p-2 text-white">
            {toTitleCase(genre)}
          </h1>
        </div>
      </PlaylistProcessorWrapper>
    </MainLayout>
  );
}

function toTitleCase(str: string) {
  if (!str) return "";
  // get rid of dashes
  str = str.replaceAll("_", " ");

  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}
