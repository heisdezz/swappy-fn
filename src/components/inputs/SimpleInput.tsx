import { Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useState } from "react";
import { useFormContext } from "react-hook-form";

export interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  errorMessage?: string;
}

const SimpleInput = forwardRef<HTMLInputElement, SimpleInputProps>(
  (
    { label, icon, name, type, errorMessage, className = "", ...props },
    ref,
  ) => {
    let formState: any = null;
    try {
      formState = useFormContext()?.formState;
    } catch {
      formState = null;
    }

    const fieldError = name && formState ? formState.errors?.[name] : undefined;
    const displayError =
      errorMessage || (fieldError?.message as string | undefined);
    const [visibility, setVisibility] = useState(type || "text");

    const isPassword = type === "password";

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="text-xs font-bold text-base-content">{label}</div>
        )}

        <div
          className={`input input-md text-sm input-bordered flex items-center gap-2.5 w-full rounded-2xl bg-base-100 transition-colors ${
            displayError
              ? "border-error focus-within:border-error"
              : "focus-within:border-primary"
          } ${className}`}
        >
          {icon && (
            <span className="text-base-content/40 flex-shrink-0">{icon}</span>
          )}
          <input
            {...props}
            id={props.id || name}
            name={name}
            ref={ref}
            type={
              isPassword
                ? visibility === "password"
                  ? "password"
                  : "text"
                : type || "text"
            }
            className="grow bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-base-content placeholder:text-base-content/40 text-sm"
          />

          {isPassword && (
            <button
              type="button"
              onClick={() =>
                setVisibility((prev) =>
                  prev === "password" ? "text" : "password",
                )
              }
              className="btn btn-xs btn-ghost btn-circle text-base-content/40 hover:text-base-content flex-shrink-0"
              aria-label={
                visibility === "password" ? "Show password" : "Hide password"
              }
            >
              {visibility === "password" ? (
                <Eye size={16} />
              ) : (
                <EyeOff size={16} />
              )}
            </button>
          )}
        </div>

        {displayError && (
          <p className="text-error text-xs font-semibold pl-1 animate-in fade-in duration-150">
            {displayError}
          </p>
        )}
      </div>
    );
  },
);

SimpleInput.displayName = "SimpleInput";
export default SimpleInput;
