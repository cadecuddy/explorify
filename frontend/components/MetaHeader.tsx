import { usePathname } from "next/navigation";

interface MetaHeaderProps {
  title: string;
  description: string;
}

export default function MetaHeader({ title, description }: MetaHeaderProps) {
  const url = usePathname();

  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="icon" type="image/svg+xml" href="/note.svg" />
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {/* TODO: ADD IMAGE */}
      {/* <meta property="og:image" content={new URL(image, Astro.url)} /> */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {/* TODO ADD IMAGE */}
      {/* <meta property="twitter:image" content={new URL(image, Astro.url)} /> */}
    </>
  );
}
