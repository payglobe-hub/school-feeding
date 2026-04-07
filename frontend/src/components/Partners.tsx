import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const Partners = () => {
  const partners = [
    {
      id: 1,
      name: "World Food Programme",
      logo: "/api/placeholder/150/80",
      type: "International Partner",
      description: "Global leader in fighting hunger worldwide, providing technical expertise and funding support.",
      website: "https://www.wfp.org",
      category: "international"
    },
    {
      id: 2,
      name: "Ghana Ministry of Education",
      logo: "/api/placeholder/150/80",
      type: "Government Partner",
      description: "Collaborating on policy development and ensuring alignment with national education goals.",
      website: "https://www.moe.gov.gh",
      category: "government"
    },
    {
      id: 3,
      name: "UNICEF Ghana",
      logo: "/api/placeholder/150/80",
      type: "UN Agency",
      description: "Supporting child nutrition programs and monitoring child development outcomes.",
      website: "https://www.unicef.org/ghana",
      category: "international"
    },
    {
      id: 4,
      name: "Ghana Health Service",
      logo: "/api/placeholder/150/80",
      type: "Government Partner",
      description: "Providing nutritional guidelines and health monitoring for school children.",
      website: "https://www.ghanahealthservice.org",
      category: "government"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'international':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'government':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'community':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'private':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'foundation':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'academic':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section className="py-20 bg-white" id="partners">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Partners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Collaborating with global organizations, government agencies, and local communities to deliver comprehensive nutrition programs
          </p>
        </motion.div>


        {/* Partners Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="bg-white rounded-xl shadow-lg p-6 group hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-12 mb-4 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Logo</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {partner.name}
                </h4>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border mb-3 ${getCategoryColor(partner.category)}`}>
                  {partner.type}
                </span>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {partner.description}
                </p>
                {partner.website !== "#" && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 group-hover:translate-x-1 transform transition-transform duration-200"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Partnership CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Become a Partner
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Join us in our mission to nourish Ghana's future. Whether you're a government agency, private company, NGO, or individual,
              there are many ways to support and collaborate with the Ghana School Feeding Programme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                Partnership Opportunities
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                Contact Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Partners;
