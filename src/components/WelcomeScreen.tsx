import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Target, 
  Award, 
  ArrowRight
} from 'lucide-react';

interface WelcomeScreenProps {
  onStartChat: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  const features = [
    {
      icon: Search,
      title: 'Live Web Search',
      description: 'Real-time scholarship discovery from thousands of sources'
    },
    {
      icon: Target,
      title: 'Personalized Matching',
      description: 'AI-powered recommendations based on your unique profile'
    },
    {
      icon: MessageCircle,
      title: 'Interactive Guidance',
      description: 'Step-by-step application support and expert advice'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Scholarships Tracked' },
    { number: '95%', label: 'Success Rate' },
    { number: '50+', label: 'Countries Covered' },
    { number: '24/7', label: 'AI Support' }
  ];

  const steps = [
    'Share your academic background and goals',
    'Get personalized scholarship recommendations',
    'Receive application guidance and tips',
    'Track your progress and deadlines'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-12"
    >
      {/* Hero Section */}
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 p-6 rounded-full">
            <Award className="h-16 w-16 text-white" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            Find Your Perfect
            <br />
            Scholarship Match
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Let our AI-powered agent guide you through personalized scholarship discovery, 
            application support, and success strategies tailored to your unique profile.
          </p>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
            className="glass-effect p-6 rounded-2xl"
          >
            <div className="text-3xl font-bold gradient-text">{stat.number}</div>
            <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="grid md:grid-cols-3 gap-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
            className="glass-effect p-8 rounded-2xl hover:shadow-xl transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="glass-effect p-8 rounded-2xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-8">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 + index * 0.1, duration: 0.3 }}
              className="flex items-start space-x-3"
            >
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-gray-700 text-left">{step}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <motion.button
          onClick={onStartChat}
          className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-3 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="h-5 w-5" />
          <span>Start Your Scholarship Journey</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        
        <p className="text-gray-500 text-sm mt-4">
          Free to use • No registration required • Instant results
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;