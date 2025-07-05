import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const formatContent = (content: string) => {
    // Handle markdown-style formatting
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        );
      }
      
      // Bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-semibold text-gray-800 mt-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      
      // Links
      if (line.includes('[Source:') && line.includes(']')) {
        const linkMatch = line.match(/\[Source: ([^\]]+)\]/);
        if (linkMatch) {
          return (
            <div key={index} className="flex items-center space-x-2 mt-1 text-sm">
              <ExternalLink className="h-3 w-3 text-primary-500" />
              <span className="text-primary-600 hover:text-primary-700 cursor-pointer">
                {linkMatch[1]}
              </span>
            </div>
          );
        }
      }
      
      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <div key={index} className="flex items-start space-x-2 mt-1">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700">{line.replace('- ', '')}</p>
          </div>
        );
      }
      
      // Numbered lists
      const numberedMatch = line.match(/^(\d+)\. (.+)/);
      if (numberedMatch) {
        return (
          <div key={index} className="flex items-start space-x-3 mt-2">
            <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {numberedMatch[1]}
            </div>
            <p className="text-gray-700">{numberedMatch[2]}</p>
          </div>
        );
      }
      
      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} className="text-gray-700 mt-1 first:mt-0">
            {line}
          </p>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  const getMessageIcon = () => {
    if (isUser) return <User className="h-4 w-4" />;
    
    switch (message.type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error-500" />;
      case 'scholarship_results':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getMessageStyle = () => {
    if (isUser) return 'chat-bubble-user';
    
    switch (message.type) {
      case 'error':
        return 'chat-bubble-agent border-error-200 bg-error-50';
      case 'scholarship_results':
        return 'chat-bubble-agent border-success-200 bg-success-50';
      default:
        return 'chat-bubble-agent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-2 flex-shrink-0"
        >
          {getMessageIcon()}
        </motion.div>
      )}
      
      <div className={`chat-bubble ${getMessageStyle()}`}>
        <div className="space-y-1">
          {formatContent(message.content)}
        </div>
        
        <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="bg-gray-400 rounded-full p-2 flex-shrink-0"
        >
          {getMessageIcon()}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MessageBubble;