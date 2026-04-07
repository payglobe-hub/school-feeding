import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Play, X, ChevronLeft, ChevronRight, Calendar, MapPin, AlertCircle } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from '../services/firebase';
import { db } from '../services/firebase';

const MediaCentre = () => {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedItem, setSelectedItem] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch photos/gallery content
      const photosQuery = query(
        collection(db, 'content'),
        where('type', 'in', ['gallery', 'image']),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      // Fetch video content
      const videosQuery = query(
        collection(db, 'content'),
        where('type', '==', 'video'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const [photosSnapshot, videosSnapshot] = await Promise.all([
        getDocs(photosQuery),
        getDocs(videosQuery)
      ]);

      const photosData = photosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled',
          description: data.excerpt || data.description || '',
          url: data.mediaUrl || data.image || '',
          thumbnail: data.thumbnail || data.mediaUrl || data.image || '',
          category: data.category || 'General',
          location: data.location || '',
          date: data.createdAt?.toDate?.()?.toISOString().split('T')[0] ||
                data.createdAt?.split('T')[0] ||
                new Date().toISOString().split('T')[0],
          tags: data.tags || [],
          isFeatured: data.isFeatured || false
        };
      });

      const videosData = videosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Video',
          description: data.excerpt || data.description || '',
          url: data.videoUrl || data.mediaUrl || '',
          thumbnail: data.thumbnail || data.mediaUrl || data.image || '',
          category: data.category || 'General',
          duration: data.duration || '0:00',
          date: data.createdAt?.toDate?.()?.toISOString().split('T')[0] ||
                data.createdAt?.split('T')[0] ||
                new Date().toISOString().split('T')[0],
          tags: data.tags || [],
          isFeatured: data.isFeatured || false
        };
      });

      setPhotos(photosData);
      setVideos(videosData);
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Failed to load media content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const currentItems = activeTab === 'photos' ? photos : videos;

  const openLightbox = (item, index) => {
    setSelectedItem(item);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedItem(null);
  };

  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < currentItems.length) {
      setLightboxIndex(newIndex);
      setSelectedItem(currentItems[newIndex]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading media...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50" id="media">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Media Centre
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore photos and videos from the Ghana School Feeding Programme
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-8 py-3 rounded-md font-medium transition-all duration-300 inline-flex items-center gap-2 ${
                activeTab === 'photos'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Photos
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-8 py-3 rounded-md font-medium transition-all duration-300 inline-flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Play className="h-4 w-4" />
              Videos
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {currentItems.length > 0 ? (
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openLightbox(item, index)}
              >
                <div className="relative overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                  {activeTab === 'videos' && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white bg-opacity-90 rounded-full p-3">
                          <Play className="h-6 w-6 text-green-600 ml-0.5" />
                        </div>
                      </div>
                      {item.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {item.duration}
                        </div>
                      )}
                    </>
                  )}
                  {item.isFeatured && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {item.location && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(item.date)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            {activeTab === 'photos' ? (
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            ) : (
              <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            )}
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No {activeTab === 'photos' ? 'photos' : 'videos'} available yet
            </h3>
            <p className="text-gray-500">
              Check back soon for updates from the Ghana School Feeding Programme.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity duration-200"
              >
                <X className="h-6 w-6" />
              </button>

              {lightboxIndex > 0 && (
                <button
                  onClick={() => navigateLightbox(-1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {lightboxIndex < currentItems.length - 1 && (
                <button
                  onClick={() => navigateLightbox(1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              <div className="relative">
                {activeTab === 'videos' ? (
                  <video
                    src={selectedItem.url}
                    controls
                    className="w-full max-h-96 object-contain bg-black"
                    poster={selectedItem.thumbnail}
                  />
                ) : (
                  <img
                    src={selectedItem.url || selectedItem.thumbnail}
                    alt={selectedItem.title}
                    className="w-full max-h-96 object-contain bg-black"
                  />
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedItem.title}</h3>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {selectedItem.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedItem.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(selectedItem.date)}
                  </div>
                </div>
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MediaCentre;
