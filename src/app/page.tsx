import Link from "next/link";
import Button from "./Button";

const ServiceCard = ({
  title,
  emoji,
  summary,
  link,
}: {
  title: string;
  emoji: string;
  summary: string;
  link: string;
}) => {
  return (
    <Link href={`/${link}/configure`}>
      <div className="flex flex-col rounded p-6 bg-stone-700 items-center gap-2 hover:cursor-pointer h-full">
        <h1 className="text-6xl">{emoji}</h1>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-center">{summary}</p>
      </div>
    </Link>
  );
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4 lg:p-16 bg-stone-800 text-white overflow-y-auto">
      <div id="mainContent" className="flex flex-col items-center gap-6">
        <div className="items-center text-center">
          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-8xl font-bold">
            🎥 Streambrah
          </h1>
          <h2 className="sm:text-xl pt-2">
            Enhance your nostr stream experience with fun widgets and services
          </h2>
        </div>
        <div className="max-w-screen-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              title="Stream Manager"
              emoji="⚙️"
              summary="Manage your nostr live event notes."
              link="streamManager"
            />
            <ServiceCard
              title="Alerts"
              emoji="⚠️"
              summary="Display zaps on stream."
              link="alerts"
            />
            <ServiceCard
              title="YouTube"
              emoji="📺"
              summary="Zap chat controlled video player."
              link="youtube"
            />
            <ServiceCard
              title="Pokemon"
              emoji="🎮"
              summary="Chat controlled Pokemon."
              link="pokemon"
            />
          </div>
        </div>

        <div></div>
      </div>
    </main>
  );
}
