import { useZodForm } from "@/utils/useZodForm";
import { z } from "zod";
import Input from "./Input";
import Button from "../Button";
import { useEffect, useState } from "react";
import { OwncastConfig, StreamConfig } from "../types";

// TODO: Persist url when navigating to different view, add to local storage
// refactor local storage
// move interval to page
export default function Owncast({
  streamConfig,
  owncastConfig,
  setOwncastConfig,
  owncastApiKey,
  setOwncastApiKey,
}: {
  streamConfig: StreamConfig;
  owncastConfig: OwncastConfig;
  setOwncastConfig: Function;
  owncastApiKey: string;
  setOwncastApiKey: Function;
}) {
  const [connected, setConnected] = useState<null | boolean>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useZodForm({
    mode: "onSubmit",
    schema: z.object({
      url: z.string().min(1).startsWith("https://"),
      accessKey: z.string().min(1),
    }),
    defaultValues: {
      url: owncastConfig.apiUrl,
      accessKey: owncastApiKey,
    },
  });

  const onSubmit = async (data: { url: string; accessKey: string }) => {
    try {
      await fetch(`${data.url}/api/status`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.accessKey}`,
        },
      });

      setConnected(true);
      setOwncastApiKey(data.accessKey);
      setOwncastConfig((prev: OwncastConfig) => {
        const newOwncastConfig: OwncastConfig = {
          ...prev,
          apiUrl: data.url,
        };
        localStorage.setItem(
          streamConfig.pubkey,
          JSON.stringify({
            streamConfig: { ...streamConfig },
            owncastConfig: newOwncastConfig,
          })
        );
        return newOwncastConfig;
      });
    } catch (e) {
      console.error(e);
      setConnected(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 py-2 px-4 overflow-y-scroll">
      <h1 className="text-lg font-semibold">Owncast</h1>
      <form
        className="flex flex-col gap-y-2 overflow-y-auto"
        spellCheck={false}
      >
        <Input
          name="Server URL"
          placeholder="https://hostname.mydomain.com"
          register={register}
          formKey="url"
          error={errors.url}
        />
        <Input
          name="Admin Access Token"
          placeholder="url/admin -> Integrations"
          register={register}
          formKey="accessKey"
          error={errors.accessKey}
        />
      </form>
      <Button disabled={!isValid} onClick={handleSubmit(onSubmit)}>
        Update
      </Button>
      {connected !== null && (
        <p>{connected ? "Connected" : "Failed to connect"}</p>
      )}
    </div>
  );
}
