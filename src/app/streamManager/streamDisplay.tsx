import { DEFAULT_RELAYS, displayName } from "@/utils/nostr";
import { useProfile } from "../useProfile";
import { StreamConfig } from "../types";

export default function StreamDisplay({
  pubkey,
  streamConfig,
  relays,
}: {
  pubkey: string;
  streamConfig: StreamConfig;
  relays?: string[];
}) {
  const { profile, isLoading } = useProfile(pubkey, DEFAULT_RELAYS);

  return (
    <div className="flex flex-col gap-2">
      <div className="h-max-1/4">
        <div id="cardThumbnailWrapper" className="relative aspect-video">
          {streamConfig.image ? (
            <img
              className="h-full w-full"
              src={streamConfig.image}
              alt={`thumbnail of ${pubkey}`}
            />
          ) : (
            <div className="h-full w-full rounded bg-stone-800"></div>
          )}
          {streamConfig.status === "live" && (
            <div className="absolute top-0 m-2.5">
              <div className="rounded bg-red-600 px-1">
                <p className="text-sm font-semibold uppercase">live</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex h-16 w-full gap-2 ">
        <div className="">
          <div className="h-10 w-10">
            {isLoading ? (
              <div className="h-full w-full rounded-[50%] bg-gray-600" />
            ) : (
              profile?.picture && (
                <img
                  className="h-8 w-8 shrink-0 rounded-[50%]"
                  src={profile.picture}
                />
              )
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          {streamConfig.title && (
            <h3 className="truncate font-bold">{streamConfig.title}</h3>
          )}
          <p className="truncate">
            {!isLoading && displayName(pubkey, profile)}
          </p>
        </div>
      </div>
    </div>
  );
}
