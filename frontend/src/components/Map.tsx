import React from 'react';
import { motion } from 'framer-motion';

const Map = () => {
  const regions = [
    { name: "Greater Accra", color: "bg-blue-500" },
    { name: "Ashanti", color: "bg-green-500" },
    { name: "Northern", color: "bg-yellow-500" },
    { name: "Central", color: "bg-red-500" },
    { name: "Western", color: "bg-purple-500" },
    { name: "Eastern", color: "bg-indigo-500" },
    { name: "Volta", color: "bg-pink-500" },
    { name: "Upper East", color: "bg-teal-500" },
    { name: "Upper West", color: "bg-orange-500" },
    { name: "Brong Ahafo", color: "bg-cyan-500" }
  ];

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
            The Ghana School Feeding Programme operates across all regions of Ghana
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
        >
          {regions.map((region, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-md p-5 text-center group hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-4 h-4 rounded-full ${region.color} mx-auto mb-3`}></div>
              <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                {region.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Map;
