import { useState } from "react";
import { ArrowLeftRight, Expand, Smartphone, Sparkles, X } from "lucide-react";
import { getPBFileUrl } from "../../client/pb";

interface ImageGalleryProps {
  images?: string[];
  collectionName?: string;
  itemId?: string;
  title?: string;
  isPromoted?: boolean;
  acceptsSwap?: boolean;
}

export function ImageGallery({
  images = [],
  collectionName = "items",
  itemId = "",
  title = "iPhone",
  isPromoted = false,
  acceptsSwap = false,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalize image URLs
  const resolvedImages = images.map((img) => {
    if (img.startsWith("/") || img.startsWith("http")) {
      return img;
    }
    return getPBFileUrl(collectionName, itemId, img);
  });

  const activeImage = resolvedImages[selectedIndex] || "";

  return (
    <div className="space-y-3">
      {/* Main Viewport */}
      <div className="relative aspect-4/3 rounded-2xl bg-base-200 border border-base-300 overflow-hidden group">
        {activeImage ? (
          <img
            src={activeImage}
            alt={title}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-base-content/40">
            <Smartphone className="w-16 h-16 stroke-[1.5]" />
            <span className="text-sm mt-2 font-medium">No photo uploaded</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isPromoted && (
            <span className="badge badge-primary text-primary-content font-bold badge-sm shadow-sm inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
          {acceptsSwap && (
            <span className="badge badge-secondary text-secondary-content font-bold badge-sm shadow-sm inline-flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3" /> Swap Eligible
            </span>
          )}
        </div>

        {/* Fullscreen Zoom Trigger */}
        {activeImage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-circle btn-sm btn-neutral absolute bottom-3 right-3 opacity-80 hover:opacity-100 shadow-md"
            aria-label="Enlarge device image"
          >
            <Expand className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Thumbnails Strip */}
      {resolvedImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {resolvedImages.map((img, index) => {
            const isSelected = selectedIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative w-20 h-16 flex-shrink-0 rounded-xl bg-base-200 border-2 overflow-hidden transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 scale-102"
                    : "border-base-300 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Modal Zoom View */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="btn btn-circle btn-sm btn-ghost text-white absolute top-6 right-6"
            aria-label="Close zoomed image"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] flex items-center justify-center p-2">
            <img
              src={activeImage}
              alt={title}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
