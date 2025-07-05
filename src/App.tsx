import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ScholarshipAgent from './components/ScholarshipAgent';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <motion.main 
        className="flex-1 flex flex-col container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ScholarshipAgent />
      </motion.main>
      
      <Footer />
    </div>
  );
}

export default App;