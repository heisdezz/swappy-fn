import { extract_message } from "@/helpers/api";
import type { QueryObserverResult } from "@tanstack/react-query";

interface CompLoaderProps<TData> {
  children?: React.ReactNode | ((data: TData) => React.ReactNode);
  query: QueryObserverResult<TData>;
  customLoading?: React.ReactNode;
  customError?: (data: any) => React.ReactNode;
}

export default function CompLoader<TData>(props: CompLoaderProps<TData>) {
  const { query, customLoading, customError } = props;
  if (query.isLoading) {
    if (customLoading) {
      return customLoading;
    }
    return (
      <div className="flex-1 p-6 grid place-items-center bg-base-100 rounded-3xl border border-base-300">
        <div className="flex flex-col items-center space-y-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-spin text-primary"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-xs font-bold text-base-content/70">
            Loading...
          </span>
          <progress className="progress progress-primary w-40 h-1"></progress>
        </div>
      </div>
    );
  }

  if (query.error) {
    const error = extract_message(query.error as any);
    if (customError) {
      return customError(error);
    }
    return (
      <div className="p-6 grid place-items-center bg-base-100 rounded-3xl border border-error/30 text-center">
        <div className="p-2 space-y-3 max-w-sm">
          <div className="text-xs font-bold text-error whitespace-pre-wrap">
            {error}
          </div>
          <button
            type="button"
            className="btn btn-error btn-xs rounded-xl font-bold"
            onClick={() => props.query.refetch()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (props.query.isSuccess && props.query.data !== undefined) {
    return (
      <>
        {typeof props.children === "function"
          ? props.children(props.query.data)
          : props.children}
      </>
    );
  }

  return null;
}
