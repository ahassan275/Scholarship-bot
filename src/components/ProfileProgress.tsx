import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Flag, 
  DollarSign, 
  Target,
  CheckCircle,
  Circle,
  TrendingUp
} from 'lucide-react';
import { UserProfile, ConversationState } from '../types';

interface ProfileProgressProps {
  userProfile: UserProfile;
  conversationState: ConversationState;
}

const ProfileProgress: React.FC<ProfileProgressProps> = ({ 
  userProfile, 
  conversationState 
}) => {
  // Debug logging
  console.log('ProfileProgress received userProfile:', userProfile);
  const profileFields = [
    {
      key: 'field_of_study',
      label: 'Field of Study',
      icon: GraduationCap,
      required: true,
      value: userProfile.field_of_study
    },
    {
      key: 'education_level',
      label: 'Education Level',
      icon: User,
      required: true,
      value: userProfile.education_level
    },
    {
      key: 'citizenship',
      label: 'Citizenship',
      icon: Flag,
      required: true,
      value: userProfile.citizenship
    },
    {
      key: 'location',
      label: 'Location',
      icon: MapPin,
      required: true,
      value: userProfile.location
    },
    {
      key: 'gpa',
      label: 'GPA',
      icon: TrendingUp,
      required: false,
      value: userProfile.gpa > 0 ? userProfile.gpa.toString() : ''
    },
    {
      key: 'financial_need',
      label: 'Financial Need',
      icon: DollarSign,
      required: false,
      value: userProfile.financial_need
    },
    {
      key: 'career_goals',
      label: 'Career Goals',
      icon: Target,
      required: false,
      value: userProfile.career_goals
    }
  ];

  const completedRequired = profileFields.filter(field => field.required && field.value && field.value.toString().trim() !== '').length;
  const totalRequired = profileFields.filter(field => field.required).length;
  const completedOptional = profileFields.filter(field => !field.required && field.value && field.value.toString().trim() !== '').length;
  
  const overallProgress = ((completedRequired + completedOptional) / profileFields.length) * 100;
  const requiredProgress = (completedRequired / totalRequired) * 100;

  const getStateColor = () => {
    switch (conversationState) {
      case 'profiling':
        return 'from-warning-500 to-orange-500';
      case 'searching':
        return 'from-primary-500 to-blue-500';
      case 'responding':
        return 'from-success-500 to-green-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStateText = () => {
    switch (conversationState) {
      case 'profiling':
        return 'Building Profile';
      case 'searching':
        return 'Finding Scholarships';
      case 'responding':
        return 'Providing Guidance';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-6 rounded-2xl"
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            className={`bg-gradient-to-r ${getStateColor()} p-2 rounded-lg`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <User className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-gray-800">Profile Status</h3>
            <p className="text-sm text-gray-600">{getStateText()}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Required Fields</span>
              <span className="font-medium">{completedRequired}/{totalRequired}</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="h-full bg-gradient-to-r from-success-500 to-green-500 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${requiredProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Fields */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect p-6 rounded-2xl"
      >
        <h3 className="font-semibold text-gray-800 mb-4">Profile Information</h3>
        
        <div className="space-y-3">
          {profileFields.map((field, index) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${
                field.value && field.value.toString().trim() !== ''
                  ? 'bg-success-100 text-success-600' 
                  : field.required 
                    ? 'bg-warning-100 text-warning-600'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                <field.icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {field.label}
                  </span>
                  {field.required && (
                    <span className="text-xs text-warning-600 bg-warning-100 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                {field.value && field.value.toString().trim() !== '' ? (
                  <p className="text-sm text-gray-600 truncate">{field.value}</p>
                ) : (
                  <p className="text-sm text-gray-400">Not provided</p>
                )}
              </div>
              
              {field.value && field.value.toString().trim() !== '' ? (
                <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Research Interests & Extracurriculars */}
      {(userProfile.research_interests.length > 0 || userProfile.extracurriculars.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect p-6 rounded-2xl"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Additional Information</h3>
          
          {userProfile.research_interests.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Research Interests</h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.research_interests.map((interest, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs"
                  >
                    {interest}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {userProfile.extracurriculars.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Extracurriculars</h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.extracurriculars.map((activity, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-xs"
                  >
                    {activity}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ProfileProgress;