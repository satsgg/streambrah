"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Pool } from "../Pool";
import { Event as NostrEvent, utils } from "nostr-tools";
import { parseZapRequest } from "@/utils/nostr";
import { parseVideoId } from "@/utils/util";
import { Video } from "./util";

// TODO:
// configurable max play time
// minimum sats to play/sats per second

export default function YouTubePlayer() {
  const [notes, setNotes] = useState<NostrEvent[]>([]);
  const [queue, setQueue] = useState<Video[]>([]);
  const [counter, setCounter] = useState(0);

  const bc = useRef(new BroadcastChannel("youtube-dock"));

  useEffect(() => {
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      const value = event.data.value;
      console.debug("channel message", type, value);
      switch (type) {
        case "addTestVideo":
          setQueue((prev) => {
            return [...prev, value];
          });
          break;
        case "skip":
          startNextVideo();
          break;
        default:
          console.error("invalid event message");
      }
    };
  }, []);

  const searchParams = useSearchParams();
  const pubkey = searchParams.get("pubkey");
  const relays = searchParams.getAll("relay");
  const now = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    console.log("subscribing to relays", relays);
    let sub = Pool.sub(relays, [
      {
        kinds: [9735],
        "#p": [pubkey || ""],
        since: now.current,
      },
    ]);

    sub.on("event", (event: NostrEvent) => {
      console.log("event", event);
      setNotes((prev) => {
        return utils.insertEventIntoDescendingList(prev, event);
      });
    });

    return () => {
      Pool.close(relays);
    };
  }, []);

  useEffect(() => {
    if (notes.length == 0 && !notes[0]) return;

    const zap = parseZapRequest(notes[0]);
    if (!zap) return;

    const videoId = parseVideoId(zap.content);
    if (!videoId) return;

    const newVideo: Video = {
      pubkey: zap.pubkey,
      id: videoId,
    };

    setQueue((prev) => {
      return [...prev, newVideo];
    });
  }, [notes]);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    event.target.playVideo();
  };

  const startNextVideo = () => {
    setQueue((prev) => {
      return [...prev.slice(1)];
    });
  };

  const opts = {
    height: "720",
    width: "1280",

    playerVars: {
      autoplay: 1,
      end: 300,
      // end: 5,
      // might be able to force autohide off by simulating a mouse hovering...
      // this way the video title/author could stay up
      controls: 0,
    },
  };

  return (
    <div className="flex justify-center items-center h-screen w-full ">
      {queue[0] ? (
        <YouTube
          videoId={queue[0].id}
          opts={opts}
          key={counter}
          onReady={onPlayerReady}
          onEnd={startNextVideo}
          onError={startNextVideo}
          // onStateChange={(event) => console.log("player event", event)}
        />
      ) : (
        <div className="h-[720px] w-[1280px] bg-black"></div>
      )}
    </div>
  );
}
