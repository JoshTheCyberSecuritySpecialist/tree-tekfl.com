import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { supabase, GalleryImage } from '../lib/supabase';
import GalleryCard from '../components/GalleryCard';

const fallbackImages = [
  {
    url: '/images/past-work/bucket-truck-tree-service-new-smyrna-central-fl.jpg',
    title: 'Bucket Truck Tree Service',
    alt: 'TREE TEK bucket truck and wood chipper providing tree service in New Smyrna Beach, Central Florida.',
    category: 'Tree Service',
  },
  {
    url: '/images/past-work/crane-tree-removal-daytona-beach-central-fl.jpg',
    title: 'Crane Tree Removal',
    alt: 'TREE TEK performing crane-assisted tree removal in Daytona Beach, Central Florida.',
    category: 'Crane Work',
  },
  {
    url: '/images/past-work/dead-pine-removal-ormond-beach-central-fl.jpg',
    title: 'Dead Pine Removal',
    alt: 'TREE TEK using a bucket truck for dead pine removal in Ormond Beach, Central Florida.',
    category: 'Tree Removal',
  },
  {
    url: '/images/past-work/fallen-oak-cleanup-central-florida-tree-service.jpg',
    title: 'Fallen Oak Cleanup',
    alt: 'TREE TEK cleaning up fallen oak tree in Central Florida.',
    category: 'Storm Cleanup',
  },
  {
    url: '/images/past-work/hurricane-storm-damage-tree-removal-central-florida.jpg',
    title: 'Hurricane Storm Damage',
    alt: 'TREE TEK emergency response to hurricane storm damage in Central Florida.',
    category: 'Storm Cleanup',
  },
  {
    url: '/images/past-work/large-tree-removal-crane-service-port-orange-central-fl.jpg',
    title: 'Large Tree Removal',
    alt: 'TREE TEK crane service removing large tree in Port Orange, Central Florida.',
    category: 'Crane Work',
  },
  {
    url: '/images/past-work/log-hauling-mini-loader-tree-cleanup-central-fl.jpg',
    title: 'Log Hauling & Cleanup',
    alt: 'TREE TEK mini loader hauling logs during tree cleanup in Central Florida.',
    category: 'Tree Service',
  },
  {
    url: '/images/past-work/tree-removal-central-florida-brush-clearing.jpg',
    title: 'Tree Removal & Brush Clearing',
    alt: 'TREE TEK performing complete tree removal and brush clearing in Central Florida.',
    category: 'Tree Removal',
  },
];

export default function PastWork() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  async function fetchGalleryImages() {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setImages(data);
      } else {
        setImages(fallbackImages.map((img, i) => ({
          id: `fallback-${i}`,
          ...img,
          created_at: new Date().toISOString(),
        })));
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setImages(fallbackImages.map((img, i) => ({
        id: `fallback-${i}`,
        ...img,
        created_at: new Date().toISOString(),
      })));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 min-h-screen">
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <img src="/treetek-logo.png" alt="" className="w-96 h-96 object-contain" />
      </div>

      <div className="relative z-10">
        <div className="text-center pt-12 pb-10">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            Our Past Work
          </h1>
          <p className="text-emerald-100 text-lg text-center max-w-3xl mx-auto mt-4 px-6">
            See our latest removals, trimming, storm cleanup & stump grinding projects
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-300 border-t-transparent"></div>
              <p className="mt-4 text-emerald-100">Loading gallery...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-10 py-10">
              {images.map((image) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-6xl max-h-[90vh] flex flex-col">
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">{selectedImage.title}</h3>
              <p className="text-gray-300">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-bold text-3xl md:text-4xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-emerald-100 text-lg md:text-xl mt-2 mb-8">
            Let us take care of your tree service needs with the same quality and professionalism
          </p>
          <a
            href="/quote"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold rounded-full px-8 py-3 hover:bg-emerald-100 hover:scale-105 shadow-lg transition-all duration-300"
          >
            Request a Free Quote
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
