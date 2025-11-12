import React from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaSlidersH, FaDownload } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: FaUpload,
      title: 'Upload Your Image',
      description: 'Drag and drop or click to upload any image. Our advanced algorithm supports all common formats and creates authentic pixel art.',
      color: 'text-blue-400'
    },
    {
      icon: FaSlidersH,
      title: 'Customize & Convert',
      description: 'Adjust pixel size (1-50px) and choose color style. Advanced color quantization creates retro game-style graphics with crisp edges.',
      color: 'text-purple-400'
    },
    {
      icon: FaDownload,
      title: 'Download Pixel Art',
      description: 'Get your authentic pixel masterpiece instantly! True retro-style graphics with simplified colors and blocky aesthetics.',
      color: 'text-green-400'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Creating pixel art has never been easier. Follow these simple steps 
            to transform your images into stunning pixel art.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-6 group-hover:bg-primary/20 transition-all duration-300"
              >
                <step.icon className={`text-3xl ${step.color}`} />
              </motion.div>
              
              <h3 className="text-2xl font-semibold text-white mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                {step.description}
              </p>
              
              {/* Step Number */}
              <div className="mt-6">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">
                  {index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Why Choose Our Tool?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-gray-300">Free</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">0</div>
                <div className="text-gray-300">Registration</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-gray-300">Uses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-gray-300">Private</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
