"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Pool } from "../Pool";
import { Event as NostrEvent, utils } from "nostr-tools";
import { parseZapRequest } from "@/utils/nostr";
import { parseVideoId } from "@/utils/util";

// TODO:
// configurable max play time
// minimum sats to play/sats per second

type Video = {
  pubkey: string;
  id: string;
};

const testVideos = [
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    id: "Yaxq3iggMdM",
  },
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    id: "4ASKMcdCc3g",
  },
];

export default function YouTubePlayer() {
  const [notes, setNotes] = useState<NostrEvent[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Video | null>(null);
  const [queue, setQueue] = useState<Video[]>([]);
  const [counter, setCounter] = useState(0);

  const bc = useRef(new BroadcastChannel("youtube-dock"));

  useEffect(() => {
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      const value = event.data.value;
      switch (type) {
        case "playTestVideo":
          console.log("play test video", value);
          setQueue((prev) => {
            return [...prev, value];
          });
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
    if (queue.length === 0) {
      setNowPlaying(null);
      return;
    }

    setNowPlaying(queue[0]);
    setQueue((prev) => {
      return [...prev.slice(1)];
    });
  };

  useEffect(() => {
    if (nowPlaying) return;
    startNextVideo();
  }, [queue]);

  useEffect(() => {
    console.log("now playing", nowPlaying, "queue", queue);
    setCounter((prev) => {
      return prev + 1;
    });
  }, [nowPlaying]);

  const opts = {
    height: "360",
    width: "640",
    playerVars: {
      autoplay: 1,
      end: 300,
      // end: 5,
      controls: 0,
    },
  };

  return (
    <>
      <YouTube
        videoId={nowPlaying?.id}
        opts={opts}
        key={counter}
        onReady={onPlayerReady}
        onEnd={startNextVideo}
        onError={startNextVideo}
        // onStateChange={(event) => console.log("player event", event)}
      />
      {!nowPlaying && (
        <div className="fixed top-0 left-0 z-2 h-[360px] w-[640px] bg-black"></div>
      )}
    </>
  );
}
