import { useZodForm } from "@/utils/useZodForm";
import { StreamConfig } from "../types";
import { z } from "zod";
import Input from "./Input";
import Button from "../Button";

export default function Settings({
  streamConfig,
  setStreamConfig,
}: {
  streamConfig: StreamConfig;
  setStreamConfig: Function;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useZodForm({
    mode: "onChange",
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      d: z.string().min(1),
      streaming: z.string().min(1),
      image: z.string(),
    }),
    defaultValues: {
      title: streamConfig.title ?? "",
      summary: streamConfig.summary ?? "",
      d: streamConfig.d ?? "",
      streaming: streamConfig.streaming ?? "",
      image: streamConfig.image ?? "",
    },
  });

  const onSubmit = (data: {
    title: any;
    summary: any;
    d: any;
    streaming: any;
    image: any;
  }) => {
    setStreamConfig((prev: StreamConfig) => {
      const newConfig = {
        ...prev,
        title: data.title,
        summary: data.summary,
        d: data.d,
        streaming: data.streaming,
        image: data.image,
      };

      // localStorage.setItem(STREAM_CONFIG_KEY, JSON.stringify(newConfig));

      return newConfig;
    });
  };
  return (
    <div className="flex flex-col h-full gap-4 py-2 px-4 overflow-y-scroll">
      <form
        className="flex flex-col gap-y-2 overflow-y-auto"
        spellCheck={false}
      >
        <Input
          name="title"
          placeholder="stream title"
          register={register}
          formKey="title"
          error={errors.title}
        />

        <Input
          name="summary"
          placeholder="stream summary"
          register={register}
          formKey="summary"
          error={errors.summary}
        />

        <Input
          name="Identifier"
          placeholder="stream identifier"
          register={register}
          formKey="d"
          error={errors.d}
        />

        <Input
          name="Thumbnail"
          placeholder="thumnbnail url"
          register={register}
          formKey="image"
          error={errors.image}
        />

        <Input
          name="Stream URL"
          placeholder="stream url"
          register={register}
          formKey="streaming"
          error={errors.streaming}
        />
      </form>
      <Button onClick={handleSubmit(onSubmit)}>Update</Button>
    </div>
  );
}
