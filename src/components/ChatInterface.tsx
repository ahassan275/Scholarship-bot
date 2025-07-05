import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message, ConversationState } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping: boolean;
  conversationState: ConversationState;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping,
  conversationState
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsSubmitting(true);

    try {
      await onSendMessage(message);
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholderText = () => {
    switch (conversationState) {
      case 'profiling':
        return 'Tell me about your field of study, education level, or goals...';
      case 'searching':
        return 'Searching for scholarships...';
      case 'responding':
        return 'Ask me anything about scholarships or applications...';
      default:
        return 'Type your message...';
    }
  };

  const getStateIndicator = () => {
    switch (conversationState) {
      case 'profiling':
        return { text: 'Building your profile', color: 'bg-warning-500' };
      case 'searching':
        return { text: 'Searching scholarships', color: 'bg-primary-500' };
      case 'responding':
        return { text: 'Ready to help', color: 'bg-success-500' };
      default:
        return { text: 'Ready', color: 'bg-gray-500' };
    }
  };

  const stateIndicator = getStateIndicator();

  return (
    <div className="glass-effect rounded-2xl h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AI</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${stateIndicator.color} rounded-full border-2 border-white`}></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Scholarship Agent</h3>
              <p className="text-sm text-gray-500">{stateIndicator.text}</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              disabled={isSubmitting || conversationState === 'searching'}
              className="input-field pr-12"
            />
            {inputValue && (
              <motion.button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isSubmitting || conversationState === 'searching'}
            className="btn-primary px-4 py-3 flex items-center justify-center min-w-[50px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;