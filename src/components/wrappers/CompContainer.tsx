import type { PropsWithChildren } from "react";

interface CompContainer extends PropsWithChildren {
  title?: string;
  rightComponent?: React.ReactNode | any;
}
export default function CompContainer(props: CompContainer) {
  return (
    <div className="flex flex-col w-full flex-1 ring fade rounded-sleek shadow-xl">
      <div className="h-14 px-4 flex items-center border-b fade rounded-t-box bg-base-200">
        <h2 className="font-bold text-xl">{props.title ?? "Title"}</h2>
        <div className="ml-auto">{props.rightComponent}</div>
      </div>
      <div className="p-4">{props.children}</div>
    </div>
  );
}
