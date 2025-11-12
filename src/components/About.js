import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaRocket, FaLock, FaHeart } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: FaShieldAlt,
      title: 'Advanced Algorithm',
      description: 'Color quantization and retro enhancement create authentic pixel art, not just blurred images.',
      color: 'text-green-400'
    },
    {
      icon: FaRocket,
      title: 'Real-time Processing',
      description: 'Instant conversion with crisp edges and simplified colors. True retro game-style graphics.',
      color: 'text-blue-400'
    },
    {
      icon: FaLock,
      title: 'Privacy First',
      description: 'All processing happens locally in your browser. Your images never leave your device.',
      color: 'text-purple-400'
    },
    {
      icon: FaHeart,
      title: 'Authentic Results',
      description: 'Creates hand-drawn pixel painting effects with blocky aesthetics and retro color palettes.',
      color: 'text-red-400'
    }
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Why Choose Us
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We've built the most user-friendly pixel art converter that puts your privacy 
            and convenience first. No registration, no data collection, just pure creativity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-primary/50 transition-all duration-300 h-full"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-6 group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className={`text-2xl ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 lg:p-12 border border-gray-700"
        >
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-6">
              Our Mission
            </h3>
            <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              We believe that creativity should be accessible to everyone. That's why we've created 
              a completely free, privacy-focused tool that lets you transform your images into 
              beautiful pixel art without any barriers. No registration, no data collection, 
              no hidden costs - just pure creative freedom.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
