import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      className="glass-effect mt-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-gray-600">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>for students worldwide</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-4 w-4" />
              <span className="text-sm">View Source</span>
            </motion.a>
            
            <motion.a
              href="#"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm">Documentation</span>
            </motion.a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2024 AI Scholarship Agent. Empowering students to achieve their dreams.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;