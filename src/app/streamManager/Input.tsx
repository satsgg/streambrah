import { FieldError } from "react-hook-form";

export default function Input({
  name,
  placeholder,
  register,
  formKey,
  error,
}: {
  name: string;
  placeholder: string;
  register: Function;
  formKey: string;
  error: FieldError | undefined;
}) {
  return (
    <div>
      <label className="text-sm capitalize">{name}</label>
      <input
        className={`
          ${error && "focus:border-red-500"}
          focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none
        `}
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        {...register(formKey)}
      />
      {error && <p className="text-sm ">{error.message}</p>}
    </div>
  );
}
