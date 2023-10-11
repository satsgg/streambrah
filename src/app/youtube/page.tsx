"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Pool } from "../Pool";
import { Event as NostrEvent, utils } from "nostr-tools";
import { parseZapRequest } from "@/utils/nostr";
import { parseVideoId } from "@/utils/util";

// TODO:
// same video back to back fails (state update doesn't trigger rerender if same value for primitives)
//   can make nowPlaying be an object with additional details like pubkey of zapper
// better video height width, center it?
// placeholder square when no video playing

export default function YouTubePlayer() {
  const [notes, setNotes] = useState<NostrEvent[]>([]);
  // const [nowPlaying, setNowPlaying] = useState<string | null>("4ASKMcdCc3g");
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  // const [queue, setQueue] = useState<string[]>(["4ASKMcdCc3g", "4ASKMcdCc3g"]);

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

    setQueue((prev) => {
      return [...prev, videoId];
    });
  }, [notes]);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    console.log("player ready");
    event.target.playVideo();
  };

  const startNextVideo = () => {
    console.log("start next video");
    if (queue.length === 0) {
      console.log("empty queue");
      setNowPlaying(null);
      return;
    }

    setNowPlaying(queue[0]);
    setQueue((prev) => {
      return [...prev.slice(1)];
    });
  };

  useEffect(() => {
    console.log("queue update", queue);
    if (nowPlaying) return;
    startNextVideo();
  }, [queue]);

  useEffect(() => {
    console.log("now playing", nowPlaying);
  }, [nowPlaying]);

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1,
      end: 300,
      // end: 10,
      controls: 0,
    },
  };

  return (
    <>
      {nowPlaying && (
        <YouTube
          videoId={nowPlaying}
          opts={opts}
          onReady={onPlayerReady}
          onEnd={() => {
            console.log("on end");
            startNextVideo();
          }}
          onError={() => {
            console.log("on error");
            startNextVideo();
          }}
          // onStateChange={(event) => console.log("player event", event)}
        />
      )}
      <div></div>
    </>
  );
}
