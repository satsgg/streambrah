import { useZodForm } from "@/utils/useZodForm";
import { z } from "zod";
import Input from "./Input";
import Button from "../Button";
import { useState } from "react";

export default function Owncast() {
  const [res, setRes] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useZodForm({
    mode: "onChange",
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
    console.debug("data", data);
    // execute test query against it

    // signal to user we are connected?`
    try {
      const res = await fetch(`${data.url}/api/status`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.accessKey}`,
        },
      });

      const json = await res.json();
      console.debug("json", json);
      setRes(JSON.stringify(json));
    } catch (e) {
      console.error(e);
      setRes(e.toString());
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
      <Button onClick={handleSubmit(onSubmit)}>Update</Button>
      <p>{res}</p>
    </div>
  );
}
