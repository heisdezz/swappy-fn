import { XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UpdateImagesProps {
  images: { url: string; path: string }[];
  setNew: (item: any) => any;
  setPrev: (item: any) => any;
}

export default function UpdateImages({
  images,
  setNew,
  setPrev,
}: UpdateImagesProps) {
  const [prevImages, setPrevImages] = useState<{ url: string; path: string }[]>(
    images || [],
  );

  useEffect(() => {
    setPrevImages(images);
  }, [images]);

  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (newImages.length > 0) {
      setNew(newImages);
    } else {
      setNew([]);
    }
  }, [newImages, setNew]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setNewImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          {...getRootProps()}
          className={`h-40 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-base-300 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <svg
              className="w-10 h-10 text-base-content opacity-60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="mt-2 text-lg font-semibold text-base-content opacity-80">
              Upload Images
            </span>
            <span className="text-sm text-base-content opacity-60">
              Drag and drop or click to upload
            </span>
          </div>
        </div>

        {prevImages?.length > 0 &&
          prevImages?.map((image, index) => (
            <div key={image.path} className="relative h-40 w-full group">
              <img
                className="size-full object-cover rounded-lg shadow-md"
                src={image.url}
                alt={`Existing image ${index + 1}`}
              />
              <button
                type="button"
                className="btn btn-circle btn-error btn-sm absolute -right-2 -top-2 m-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => {
                  setPrevImages((prev) =>
                    prev.filter((img) => img.path !== image.path),
                  );
                  setPrev((prev: any[]) =>
                    prev.filter((img) => img.path !== image.path),
                  );
                }}
                aria-label="Remove existing image"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          ))}

        {newImages &&
          newImages.map((image, index) => (
            <div
              key={image.name + index}
              className="relative h-40 w-full group"
            >
              <img
                className="size-full object-cover rounded-lg shadow-md"
                src={URL.createObjectURL(image)}
                alt={`Uploaded image ${index + 1}`}
              />
              <button
                type="button"
                className="btn btn-circle btn-error btn-sm absolute -right-2 -top-2 m-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => {
                  setNewImages((prev) => prev.filter((_, i) => i !== index));
                }}
                aria-label="Remove new image"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
