import { useState } from "react";

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  const setPagination = (newPage: number) => setPage(Math.max(1, newPage));

  return { page, pageSize, setPagination };
}
