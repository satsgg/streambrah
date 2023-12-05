"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Configure() {
  const [link, setLink] = useState<string>("");
  useEffect(() => {
    const hostname = window.location.origin;
    setLink(hostname);
  }, []);

  return (
    <main className="flex flex-col min-h-screen p-16 bg-stone-800 text-white overflow-y-auto">
      <Link href="/">
        <h1 className="text-3xl">🎥</h1>
      </Link>

      <div className="flex justify-center">
        <div className="flex flex-col w-1/3 gap-y-2">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-5xl font-semibold">⚙️ Stream Manager</h1>
            <p>
              An OBS custom dock that helps configure and publish nostr kind
              30311 events.
            </p>
          </div>

          <h2 className="text-xl font-semibold pt-6">Try it</h2>
          <div className="flex flex-col gap-1">
            <input
              className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
              type="text"
              readOnly
              autoComplete="off"
              value={`${link}/streamManager`}
            />
            <label className="text-sm italic">
              {"Add this URL into Docks -> Custom Browser Docks..."}
            </label>
          </div>

          <p>{"Go to Tools -> Websocket Server Settings."}</p>
          <p>Check the box labeled &apos;Enable Websocket server.&apos;</p>

          <h2 className="text-xl font-semibold pt-4">How it works</h2>
          <p>
            Going live on nostr requires publishing a{" "}
            <a
              href="https://github.com/nostr-protocol/nips/blob/master/53.md"
              className="text-blue-200"
            >
              kind 30311 &apos;Live Event&apos;
            </a>{" "}
            event that contains a link to your streaming url.
          </p>
          <p>
            You can additionally provide things like your thumbnail, stream
            title, description, and relays.
          </p>
          <p>
            You also need to include a status in the note that says if your
            stream is planned, started, or ended. The status will indicate to
            clients that your stream is live and browseable.
          </p>
          <p>
            The Stream Manager dock helps you configure all of your settings. It
            will also publish the kind 30311 note to your configured relays when
            you click &apos;Start Streaming&apos; and &apos;Stop Streaming&apos;
            in OBS.
          </p>
          <p>
            The tool will also automatically publish the event every hour as per
            the NIP. Any changes to your event configuration will be
            automatically published while you are live.
          </p>
          <p>
            Settings from the Stream Manager will be sourced for all other
            Streambrah apps.
          </p>
        </div>
      </div>
    </main>
  );
}
