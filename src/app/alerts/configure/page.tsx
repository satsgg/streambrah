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
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-5xl font-semibold">⚠️ Alerts</h1>
            <p>Live zap chat alerts!</p>
          </div>

          <h2 className="text-xl font-semibold pt-6">Try it</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p>Alerts</p>
              <input
                className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
                type="text"
                readOnly
                autoComplete="off"
                value={`${link}/alerts`}
              />
              <label className="text-sm italic">
                {"Add the URL into an OBS browser source."}
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <p>Alerts controller dock</p>
              <input
                className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
                type="text"
                readOnly
                autoComplete="off"
                value={`${link}/alerts/dock`}
              />
              <label className="text-sm italic">
                {"Add this URL into Docks -> Custom Browser Docks..."}
              </label>
            </div>
          </div>

          <h2 className="text-xl font-semibold pt-4">How it works</h2>
          <p>Zap chat messages are displayed on your live stream.</p>
          <p>
            The controller dock provided allows you to display test zaps to
            configure the positioning of your alerts browser source.
          </p>
          <p>
            The alerts widget relies on settings from the Stream Manager. Start
            there first!
          </p>
        </div>
      </div>
    </main>
  );
}
