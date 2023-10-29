"use client";
import { useRef, useState } from "react";
import { ZapAlert, testZaps } from "../util";

export default function Dock() {
  const bc = useRef(new BroadcastChannel("alerts-dock"));
  const [currentTestZap, setCurrentTestZap] = useState(0);

  const addTestZap = async () => {
    const testZap: ZapAlert = {
      pubkey: testZaps[currentTestZap].pubkey,
      id: testZaps[currentTestZap].id,
      amount: testZaps[currentTestZap].amount,
      content: testZaps[currentTestZap].content,
    };

    bc.current.postMessage({
      type: "zap",
      value: testZap,
    });
    if (currentTestZap + 1 == testZaps.length) {
      setCurrentTestZap(0);
      return;
    }
    setCurrentTestZap(currentTestZap + 1);
  };

  return (
    <div className="flex flex-col gap-y-2 h-screen bg-gray-800 text-white p-2">
      <button className="rounded bg-gray-600 px-2 py-1" onClick={addTestZap}>
        Test zap alert
      </button>
    </div>
  );
}
