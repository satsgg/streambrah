"use client";
import LiftedWavmanPlayer from "./LiftedWavmanPlayer";
import RelayProvider from "./nostr/relayProvider";
import { HotkeysProvider } from "react-hotkeys-hook";

const relayUrl = process.env.NEXT_PUBLIC_RELAY_URL || "";

export default function Wavman() {
  return (
    <main className="py-4 md:py8">
      <RelayProvider url={relayUrl}>
        <HotkeysProvider initiallyActiveScopes={["player"]}>
          <LiftedWavmanPlayer />
        </HotkeysProvider>
      </RelayProvider>
    </main>
  );
}
