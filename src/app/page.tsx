import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-16 justify-center items-center">
      <div id="mainContent" className="flex h-full justify-center">
        <div className="flex flex-col justify-center">
          <h1 className="text-8xl font-bold align-center text-center">
            🎥 Kitted
          </h1>
          <h2 className="text-xl pt-2">
            Enhance your nostr stream experience with fun widgets and services
          </h2>
          <div className="flex justify-between gap-x-4 mt-8">
            <Link href="/notifications/configure">
              <div className="hover:bg-gray-300 hover:cursor-pointer border rounded p-2">
                <h2 className="text-xl font-semibold">⚠️ Alerts️</h2>
              </div>
            </Link>
            <Link href="/youtube/configure">
              <div className="hover:bg-gray-300 hover:cursor-pointer border rounded p-2">
                <h2 className="text-xl font-semibold">📺 Youtube</h2>
              </div>
            </Link>
            {/* <Link href="/pokemon/configure"> */}
            <div className="hover:bg-gray-300 hover:cursor-not-allowed border rounded p-2">
              {/* <h2 className="text-xl font-semibold">🐱 Pokemon</h2> */}
              <h2 className="text-xl font-semibold">🤫 Surprise</h2>
            </div>
            {/* </Link> */}
          </div>
        </div>
        <div></div>
      </div>
    </main>
  );
}
