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

  // TODO: More formatting, add zap amount
  return (
    <div className="flex justify-between text-white py-1 lg:w-1/2 items-center">
      <div className="flex gap-1 items-center">
        {profile?.picture && (
          <img
            className="h-10 w-10 shrink-0 rounded-[50%]"
            src={profile.picture}
          />
        )}
        <p className="w-full text-xl font-semibold">
          {fmtMsg(displayName(video.pubkey, profile), 20)}
          {/* {fmtMsg(video.pubkey, 25)} */}
        </p>
      </div>
      <div className="flex gap-x-2 items-center">
        <div>
          <h1 className="text-xl font-semibold text-right">
            {fmtMsg(video.title, 30)}
          </h1>
          <h3 className="text-lg text-gray-400 text-right">
            {fmtMsg(video.author, 30)}
          </h3>
        </div>
        <img className="h-12 w-12 rounded" src={video.thumbnail} />
      </div>
    </div>
  );
}
