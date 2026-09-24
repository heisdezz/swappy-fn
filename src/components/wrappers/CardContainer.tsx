import type { PropsWithChildren } from "react";

export const arr = Array.from({ length: 10 }, (_, i) => i + 1);
export default function CardContainer(props: PropsWithChildren) {
  return (
    <div className="grid md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
      {props.children}
      {/*{arr.map((item) => (
        <Card item={item} key={item} />
      ))}*/}
    </div>
  );
}
