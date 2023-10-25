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
    <div className="flex justify-between text-white py-1 items-center">
      <div className="flex gap-2 items-center max-w-1/3">
        {profile?.picture && (
          <img
            className="h-10 w-10 shrink-0 rounded-[50%]"
            src={profile.picture}
          />
        )}
        <p className="w-full text-xl font-semibold text-ellipsis max-w-1/3">
          {fmtMsg(displayName(video.pubkey, profile), 15)}
        </p>
      </div>
      <div className="flex gap-x-2 items-center">
        <div>
          <h1 className="text-xl font-semibold text-right text-ellipsis whitespace-nowrap">
            {fmtMsg(video.title, 20)}
          </h1>
          <h3 className="text-lg text-gray-400 text-right text-ellipsis whitespace-nowrap">
            {fmtMsg(video.author, 20)}
          </h3>
        </div>
        <img className="h-12 w-12 rounded" src={video.thumbnail} />
      </div>
    </div>
  );
}
