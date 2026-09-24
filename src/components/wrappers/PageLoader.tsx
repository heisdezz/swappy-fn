import { extract_message } from "@/helpers/api";
import type { QueryObserverResult } from "@tanstack/react-query";

interface PageLoaderProps<TData> {
  children?: React.ReactNode | ((data: TData) => React.ReactNode);
  query: QueryObserverResult<TData>;
  customLoading?: React.ReactNode;
}

export default function PageLoader<TData>(props: PageLoaderProps<TData>) {
  const { query, customLoading } = props;
  if (query.isLoading) {
    if (customLoading) {
      return customLoading;
    }
    return (
      <div className="min-h-[400px] grid place-items-center bg-base-100 rounded-3xl border border-base-300">
        <div className="flex flex-col items-center space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
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
          <span className="text-sm font-bold text-base-content/80">
            Loading...
          </span>
          <progress className="progress progress-primary w-48 h-1.5"></progress>
        </div>
      </div>
    );
  }

  if (query.isError) {
    const error = extract_message(query.error as any);
    return (
      <div className="p-8 min-h-[360px] grid place-items-center bg-base-100 rounded-3xl border border-error/30 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="text-sm font-bold text-base-content whitespace-pre-wrap">
            {error}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-error btn-sm rounded-xl font-bold"
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
      <div className="flex-1">
        {typeof props.children === "function"
          ? props.children(props.query.data)
          : props.children}
      </div>
    );
  }

  return null;
}
