"use client";
import { useRef, useState } from "react";
import { Video, queryVideo, testVideos } from "../util";
import Button from "@/app/Button";

export default function Dock() {
  const bc = useRef(new BroadcastChannel("youtube-dock"));
  const [currentTestVideo, setCurrentTestVideo] = useState(0);

  const addTestVideo = async () => {
    const res = await queryVideo(testVideos[currentTestVideo].id);
    if (!res) return;

    const { title, author, thumbnail } = res;
    const newVideo: Video = {
      pubkey: testVideos[currentTestVideo].pubkey,
      eventId: testVideos[currentTestVideo].eventId,
      id: testVideos[currentTestVideo].id,
      amount: testVideos[currentTestVideo].amount,
      title: title,
      author: author,
      thumbnail: thumbnail,
    };

    bc.current.postMessage({
      type: "addTestVideo",
      value: newVideo,
    });
    if (currentTestVideo + 1 == testVideos.length) {
      setCurrentTestVideo(0);
      return;
    }
    setCurrentTestVideo(currentTestVideo + 1);
  };

  const skip = () => {
    bc.current.postMessage({
      type: "skip",
      value: null,
    });
  };

  // TODO:
  // - show now playing?
  // - pause?
  // - set minimum zap cost
  // - set cost per second?

  return (
    <div className="flex flex-col gap-y-2 h-screen p-2 bg-stone-800 text-white">
      <Button onClick={addTestVideo}>Add test video</Button>
      <Button onClick={skip}>Skip</Button>
    </div>
  );
}
