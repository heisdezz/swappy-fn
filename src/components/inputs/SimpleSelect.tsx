import { pb } from "#/client/pb";
import { useQuery } from "@tanstack/react-query";
import { type PropsWithChildren } from "react";
import type { RecordModel } from "pocketbase";
import { useFormContext } from "react-hook-form";

interface SimpleSelectProps<T extends RecordModel> extends PropsWithChildren {
  route: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  label?: string;
  name?: string;
  placeholder?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export default function SimpleSelect<T extends RecordModel>(
  props: SimpleSelectProps<T>,
) {
  const {
    route,
    value,
    onChange,
    label,
    name,
    placeholder = "All",
    render,
  } = props;

  // SAFE: prevents crash when no FormProvider exists
  let formState: any = null;
  try {
    formState = useFormContext()?.formState;
  } catch {
    formState = null;
  }

  const error = name && formState ? formState.errors?.[name] : undefined;

  const query = useQuery<T[]>({
    queryKey: ["select", route],
    queryFn: () => pb.collection(route).getFullList<T>(),
  });

  if (query.isLoading)
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={`select-${route}`}
            className="mb-2 fieldset-label font-semibold"
          >
            <span className="text-sm">{label}</span>
          </label>
        )}
        <select
          disabled
          name={name || `select-${route}`}
          className="select select-md w-full select-bordered"
          id={`select-${route}`}
        >
          <option value="">Loading...</option>
        </select>
      </div>
    );

  if (query.isError)
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={`select-${route}`}
            className="mb-2 fieldset-label font-semibold"
          >
            <span className="text-sm">{label}</span>
          </label>
        )}
        <select
          disabled
          name={name || `select-${route}`}
          className="select select-md w-full select-bordered border-error"
          id={`select-${route}`}
        >
          <option value="">Error loading options</option>
        </select>
      </div>
    );

  const items: T[] = query.data ?? [];

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="fieldset-label font-semibold">
          <span className="text-sm">{label}</span>
        </div>
      )}
      <select
        value={value === null || value === undefined ? "null" : value}
        onChange={(e) => {
          const newValue = e.target.value === "null" ? null : e.target.value;
          onChange?.(newValue);
        }}
        className={`select select-md w-full select-bordered ${error ? "select-error" : ""}`}
        id={`select-${route}`}
        name={name || `select-${route}`}
      >
        <option value="null">{placeholder}</option>
        {items.map((item, index) => render(item, index))}
      </select>
      {error && <p className="text-error text-sm mt-1">{error.message}</p>}
    </div>
  );
}
