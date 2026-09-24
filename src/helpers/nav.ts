import { useQuery } from "@tanstack/react-query";
import { pb } from "../client/pb";
import type { StoreResponse } from "../../pocketbase-types";

export type NavLink = {
  name: string;
  path: string;
};

export function useNavSections() {
  const query = useQuery({
    queryKey: ["stores-nav"],
    queryFn: () =>
      pb.collection("store").getFullList<StoreResponse>({ sort: "name" }),
    staleTime: 5 * 60 * 1000,
  });

  const baseLinks: NavLink[] = [
    { name: "Explore", path: "/explore" },
    { name: "Verified Stores", path: "/stores" },
  ];

  if (query.data && query.data.length > 0) {
    const dynamicLinks: NavLink[] = query.data.map((store) => ({
      name: store.name,
      path: `/store/${store.slug || store.id}`,
    }));
    return { navLinks: [...baseLinks, ...dynamicLinks], stores: query.data };
  }

  return {
    navLinks: baseLinks,
    stores: [],
  };
}
