
import React from 'react';
import { Sparkles, Search, Code, BookOpen } from 'lucide-react';

interface DefaultQuestionsProps {
  onQuestionSelect: (question: string) => void;
}

const DefaultQuestions: React.FC<DefaultQuestionsProps> = ({ onQuestionSelect }) => {
  const questions = [
    'How does AI work?',
    'Are black holes real?',
    'How many Rs are in the word "strawberry"?',
    'What is the meaning of life?'
  ];

  const categories = [
    { icon: Sparkles, label: 'Create', color: 'from-purple-500 to-pink-500' },
    { icon: Search, label: 'Explore', color: 'from-blue-500 to-cyan-500' },
    { icon: Code, label: 'Code', color: 'from-green-500 to-emerald-500' },
    { icon: BookOpen, label: 'Learn', color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          How can I help you?
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Choose a category or ask me anything
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-8 max-w-2xl mb-12">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`px-6 py-3 bg-gradient-to-r ${category.color} text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200 hover:scale-105`}
          >
            <category.icon size={16} className="inline mr-2" />
            {category.label}
          </button>
        ))}
      </div>
      
      <div className="space-y-3 w-full max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center mb-6">
          Or try these popular questions
        </h3>
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(question)}
            className="w-full text-left p-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md"
          >
            <span className="text-purple-500 mr-2">→</span>
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DefaultQuestions;
