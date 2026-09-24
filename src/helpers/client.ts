import { pb } from "#/client/pb";
import { useCallback, useEffect, useState } from "react";

export const useDrawerHandle = (drawerId: string) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle_drawer = useCallback(() => {
    const el = document.getElementById(drawerId) as HTMLInputElement | null;
    el?.click();
  }, [drawerId]);

  useEffect(() => {
    const el = document.getElementById(drawerId) as HTMLInputElement | null;
    if (!el) return;
    const handler = () => setIsOpen(el.checked);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [drawerId]);

  return [isOpen, toggle_drawer] as const;
};

export const get_fiel_url = (
  record: { [key: string]: any },
  filename: string,
) => {
  return pb.files.getURL(record, filename);
};
