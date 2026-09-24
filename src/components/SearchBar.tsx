import { useNavigate, useLocation } from "@tanstack/react-router";
import { ArrowRight, Search as IconSearch, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  navigateOnSubmit?: boolean;
}

export default function SearchBar({
  className = "",
  placeholder = "Search iPhone models, storage, battery...",
  value,
  onChange,
  onClear,
  navigateOnSubmit = true,
}: SearchBarProps) {
  const form = useForm({ defaultValues: { query: value || "" } });
  const nav = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const queryValue = form.watch("query");

  // Keep input synchronized with controlled value prop if provided
  useEffect(() => {
    if (value !== undefined) {
      form.setValue("query", value);
    }
  }, [value, form]);

  // Keep input synchronized with active search parameter in URL (when not controlled by value prop)
  const urlSearch =
    (location.search as any)?.q ||
    (location.search as any)?.search ||
    (location.search as any)?.query ||
    "";

  useEffect(() => {
    if (value === undefined && urlSearch) {
      form.setValue("query", urlSearch);
    }
  }, [value, urlSearch, form]);

  const search = ({ query }: { query: string }) => {
    const trimmed = query?.trim();
    if (onChange) {
      onChange(trimmed);
    }
    if (navigateOnSubmit) {
      nav({
        to: "/explore" as string,
        search: (prev: any) => ({ ...prev, q: trimmed || undefined }),
      });
    }
  };

  const handleClear = () => {
    form.setValue("query", "");
    inputRef.current?.focus();
    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange("");
    }
    if (navigateOnSubmit && urlSearch) {
      nav({
        to: "/explore" as string,
        search: (prev: any) => {
          const next = { ...prev };
          delete next.search;
          delete next.query;
          delete next.q;
          return next;
        },
      });
    }
  };

  const {
    ref: formRegisterRef,
    onChange: formRegisterOnChange,
    ...restRegister
  } = form.register("query");

  return (
    <form
      onSubmit={form.handleSubmit(search)}
      className={`w-full max-w-xl ${className}`}
    >
      <label className="input input-bordered flex items-center gap-3 w-full h-11 px-4 rounded-2xl bg-base-100 border-base-300 shadow-xs focus-within:border-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
        {/* Search Icon with DaisyUI styling */}
        <IconSearch className="w-4 h-4 text-base-content/50 shrink-0" />

        {/* Growable Input */}
        <input
          {...restRegister}
          onChange={(e) => {
            formRegisterOnChange(e);
            if (onChange) {
              onChange(e.target.value);
            }
          }}
          ref={(el) => {
            formRegisterRef(el);
            inputRef.current = el;
          }}
          type="search"
          placeholder={placeholder}
          aria-label="Search iPhones"
          autoComplete="off"
          className="grow bg-transparent text-xs sm:text-sm text-base-content placeholder:text-base-content/40 outline-none border-none focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden"
        />

        {/* Action Buttons & Kbd Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          {queryValue ? (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content"
                title="Clear search"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-circle btn-xs shadow-xs"
                title="Submit search"
                aria-label="Submit search"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <kbd className="kbd kbd-sm hidden sm:inline-flex font-mono text-[10px] text-base-content/50 bg-base-200 border-base-300 select-none">
              Enter
            </kbd>
          )}
        </div>
      </label>
    </form>
  );
}
