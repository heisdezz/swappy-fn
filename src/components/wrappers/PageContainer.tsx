import type { PropsWithChildren } from "react";

interface PageContainerProps extends PropsWithChildren {}

export default function PageContainer(props: PageContainerProps) {
  return (
    <section className="container mx-auto p-4 py-6 space-y-24">
      {props.children}
    </section>
  );
}
