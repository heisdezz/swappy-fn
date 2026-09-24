import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      {label && (
        <span className="text-sm font-semibold">{label}</span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="input input-bordered w-full flex items-center gap-3 cursor-pointer hover:border-primary transition-colors"
        >
          <span
            className="w-7 h-7 rounded-lg border border-base-300 shrink-0 shadow-sm"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-sm text-base-content/70 uppercase flex-1 text-left">
            {value}
          </span>
          <span className="text-xs text-base-content/30">pick</span>
        </button>

        {open && (
          <div className="absolute z-50 top-full mt-2 left-0 bg-base-100 border border-base-200 rounded-2xl shadow-xl p-3">
            <HexColorPicker color={value} onChange={onChange} />
            <div className="mt-2 flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-md border border-base-300 shrink-0"
                style={{ backgroundColor: value }}
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
                }}
                className="input input-sm input-bordered font-mono w-full uppercase"
                maxLength={7}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
