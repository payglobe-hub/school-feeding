import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Heart, BookOpen, Globe, TrendingUp } from 'lucide-react';

const Mandates = () => {
  const mandates = [
    {
      id: 1,
      title: "Ensure Food Security",
      icon: Shield,
      description: "Guarantee that every school child receives at least one nutritious meal per school day, contributing to food security and reducing hunger.",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Support Education",
      icon: BookOpen,
      description: "Improve school attendance, retention, and academic performance by addressing hunger as a barrier to education.",
      color: "from-green-500 to-green-600"
    },
    {
      id: 3,
      title: "Promote Agriculture Linkages",
      icon: Globe,
      description: "Support local farmers and caterers by creating sustainable markets for locally-produced food, stimulating rural economies.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: 4,
      title: "Enhance Child Health",
      icon: Heart,
      description: "Improve child nutrition, growth, and development outcomes through balanced, culturally-appropriate meals.",
      color: "from-red-500 to-red-600"
    },
    {
      id: 5,
      title: "Foster Community Development",
      icon: Users,
      description: "Build partnerships with communities, schools, and stakeholders to create sustainable nutrition programs.",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: 6,
      title: "Monitor & Evaluate Impact",
      icon: TrendingUp,
      description: "Continuously assess program effectiveness, nutritional outcomes, and socio-economic impacts to ensure quality delivery.",
      color: "from-indigo-500 to-indigo-600"
    }
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

  return (
    <section className="py-20 bg-gray-50" id="mandates">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 bg-green-100 rounded-2xl shadow-lg p-8 border border-green-200"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Mandates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The core responsibilities and commitments that drive our mission to nourish Ghana's children
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {mandates.map((mandate) => {
            const IconComponent = mandate.icon;
            return (
              <motion.div
                key={mandate.id}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-green-100 rounded-xl shadow-lg p-6 group hover:shadow-xl transition-all duration-300 border border-green-200"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${mandate.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {mandate.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {mandate.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Committed to Excellence
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Our mandates are not just words on paper - they are the foundation of our daily operations and the measure of our success.
              We work tirelessly to fulfill each mandate, ensuring that every Ghanaian child receives the nutrition they need to thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                Read Our Annual Report
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                View Program Guidelines
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Mandates;
