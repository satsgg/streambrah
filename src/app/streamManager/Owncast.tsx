import { useZodForm } from "@/utils/useZodForm";
import { z } from "zod";
import Input from "./Input";
import Button from "../Button";
import { useEffect, useState } from "react";
import { StreamConfig } from "../types";

export default function Owncast({
  streamConfig,
  setStreamConfig,
}: {
  streamConfig: StreamConfig;
  setStreamConfig: Function;
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
      url: "",
      accessKey: "",
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
    } catch (e) {
      console.error(e);
      setConnected(false);
    }
  };

  useEffect(() => {
    if (!connected || streamConfig.status !== "live") return;

    const fetchInterval = setTimeout(async () => {
      const url = getValues("url");
      const key = getValues("accessKey");
      if (!url || !key) return;

      try {
        const res = await fetch(`${url}/api/status`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
        });
        const json = await res.json();
        if (!json.viewerCount) return;
        setStreamConfig((prev: StreamConfig) => {
          return {
            ...prev,
            currentParticipants: json.viewerCount.toString(),
          };
        });
      } catch (e) {
        console.error(e);
      }
    }, 15000);

    return () => {
      clearInterval(fetchInterval);
    };
  }, [connected, streamConfig.status]);

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
