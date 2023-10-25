"use client";
import { Video } from "../util";

export default function VideoDisplay({ video }: { video: Video }) {
  return <div>{video.id}</div>;
}
