import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleMapComponent = () => {
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    // Add Google Maps script to head if not already present
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Initialize map when Google Maps is ready
    const initMap = () => {
      if (mapRef.current && window.google && window.google.maps) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 7.9465, lng: -1.0232 }, // Center of Ghana
          zoom: 7,
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [{ color: "#3B82F6" }, { weight: 2 }]
            }
          ]
        });

        // Add region overlays
        const regions = [
          {
            name: "Greater Accra",
            path: [
              { lat: 5.5, lng: -0.3 },
              { lat: 5.8, lng: -0.3 },
              { lat: 5.8, lng: -0.0 },
              { lat: 5.5, lng: -0.0 }
            ],
            color: "#3B82F6",
            schools: 1200,
            children: 480000
          },
          {
            name: "Ashanti",
            path: [
              { lat: 6.0, lng: -2.5 },
              { lat: 7.5, lng: -2.5 },
              { lat: 7.5, lng: -0.8 },
              { lat: 6.0, lng: -0.8 }
            ],
            color: "#10B981",
            schools: 2400,
            children: 960000
          }
        ];

        regions.forEach(region => {
          const polygon = new window.google.maps.Polygon({
            paths: region.path,
            fillColor: region.color,
            fillOpacity: 0.3,
            strokeColor: region.color,
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: map
          });

          polygon.addListener('click', () => {
            const event = new CustomEvent('regionSelected', { 
              detail: region 
            });
            window.dispatchEvent(event);
          });

          polygon.addListener('mouseover', () => {
            polygon.setOptions({ fillOpacity: 0.6 });
          });

          polygon.addListener('mouseout', () => {
            polygon.setOptions({ fillOpacity: 0.3 });
          });
        });
      }
    };

    // Try to initialize immediately or wait for Google Maps to load
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Poll for Google Maps availability
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          initMap();
          clearInterval(checkInterval);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);
    }
  }, []);

  return (
    <div className="w-full h-96 lg:h-full rounded-2xl overflow-hidden">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

// Demo region data for interface preview
const demoRegions = [
  { id: 'greater-accra', name: "Greater Accra", schools: 1200, children: 480000 },
  { id: 'ashanti', name: "Ashanti", schools: 2400, children: 960000 },
  { id: 'northern', name: "Northern", schools: 1800, children: 720000 },
  { id: 'central', name: "Central", schools: 900, children: 360000 }
];

const Map = () => {
  const [apiKey] = useState(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE");
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Listen for region selection events from Google Maps
  React.useEffect(() => {
    const handleRegionSelected = (event) => {
      setSelectedRegion(event.detail);
    };

    window.addEventListener('regionSelected', handleRegionSelected);
    return () => {
      window.removeEventListener('regionSelected', handleRegionSelected);
    };
  }, []);

  return (
    <section className="py-20 bg-gray-50" id="map">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Regional Coverage
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The Ghana School Feeding Programme operates across all 16 regions of Ghana
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Google Maps */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-4">
              {apiKey !== "YOUR_API_KEY_HERE" ? (
                <div className="w-full h-96 lg:h-full rounded-2xl">
                  <GoogleMapComponent />
                </div>
              ) : (
                <div className="w-full h-96 lg:h-full rounded-2xl bg-gray-100 flex flex-col items-center justify-center">
                  <div className="text-center p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Google Maps Integration
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add your Google Maps API key to enable interactive map
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Setup Instructions:</strong><br/>
                        1. Get a free Google Maps API key<br/>
                        2. Add to your environment variables:<br/>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
                        </code>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Test Interactive Interface</h4>
                    <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                      {demoRegions.map((region) => (
                        <button
                          key={region.id}
                          onClick={() => setSelectedRegion(region)}
                          className="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          {region.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Region Information Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <AnimatePresence mode="wait">
              {selectedRegion ? (
                <motion.div
                  key={selectedRegion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedRegion.name}
                    </h3>
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedRegion.schools.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-800">Schools Covered</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedRegion.children.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-800">Children Fed Daily</div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-lg font-semibold text-yellow-700">
                        100%
                      </div>
                      <div className="text-sm text-yellow-800">District Coverage</div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Regional Statistics
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        16
                      </div>
                      <div className="text-sm text-gray-600">Regions Covered</div>
                    </div>
                    
                    <div className="text-center py-4">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        15,600
                      </div>
                      <div className="text-sm text-gray-600">Total Schools</div>
                    </div>
                    
                    <div className="text-center py-4">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        6.2M
                      </div>
                      <div className="text-sm text-gray-600">Children Fed Daily</div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 text-center">
                        Click on any region to view detailed statistics
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Map;
