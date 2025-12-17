import { useState } from 'react';
import { GalleryImage } from '../lib/supabase';

interface GalleryCardProps {
  image: GalleryImage;
  onClick: () => void;
}

export default function GalleryCard({ image, onClick }: GalleryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 animate-shimmer rounded-lg"></div>
      )}

      {imageError ? (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/30 to-emerald-700/20 flex flex-col items-center justify-center">
          <p className="text-white/80 italic font-medium text-lg">Photo coming soon</p>
          <p className="text-emerald-200/60 text-sm mt-2">{image.category}</p>
        </div>
      ) : (
        <>
          <img
            src={image.url}
            alt={image.alt}
            className={`w-full h-full object-contain group-hover:scale-105 transition duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />

          {imageLoaded && (
            <>
              <div className="absolute bottom-0 w-full bg-emerald-900/70 text-white text-center py-2 text-sm font-semibold">
                {image.category}
              </div>

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                <div className="text-center px-4">
                  <h3 className="text-white font-bold text-xl mb-2">{image.title}</h3>
                  <p className="text-emerald-200 text-sm">{image.category}</p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </button>
  );
}
