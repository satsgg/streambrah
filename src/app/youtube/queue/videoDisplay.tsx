"use client";
import { useProfile } from "@/app/useProfile";
import { Video } from "../util";
import { displayName } from "@/utils/nostr";
import { fmtMsg } from "@/utils/util";

export default function VideoDisplay({
  video,
  relays,
}: {
  video: Video;
  relays: string[];
}) {
  const { profile, isLoading } = useProfile(video.pubkey, relays);
  // return <div>{video.id}</div>;
  return (
    <div className="flex justify-between text-white px-4 py-1 lg:w-1/2  items-center">
      <div className="flex gap-1 items-center">
        {profile?.picture && (
          <img
            className="h-8 w-8 shrink-0 rounded-[50%]"
            src={profile.picture}
          />
        )}
        <p className="w-full text-xl font-semibold">
          {displayName(video.pubkey, profile).slice(0, 15)}
          {/* {input.pubkey.slice(0, 30)} */}
        </p>
      </div>
      <div className="flex gap-x-2">
        <div>
          <h1 className="font-semibold">{fmtMsg(video.title, 30)}</h1>
          <h3 className="text-md text-gray-400">{fmtMsg(video.author, 30)}</h3>
        </div>
        <img className="h-8 w-8 rounded" src={video.thumbnail} />
      </div>
    </div>
  );
}
