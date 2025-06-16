
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import DefaultQuestions from '@/components/DefaultQuestions';
import ChatInput from '@/components/ChatInput';
import LoginModal from '@/components/LoginModal';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  attachments?: Array<{ type: 'image' | 'document' | 'link'; url: string; name: string }>;
}

interface Chat {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'How does machine learning work?',
      timestamp: '2 hours ago',
      messages: [
        {
          id: 'msg-1',
          content: 'How does machine learning work?',
          sender: 'user',
          timestamp: '2:30 PM'
        },
        {
          id: 'msg-2',
          content: `# Machine Learning Explained

Machine learning is a subset of **artificial intelligence** that enables computers to learn and make decisions from data without being explicitly programmed for every task.

## How It Works

1. **Data Collection**: Gather relevant data for training
2. **Training**: The algorithm learns patterns from the data
3. **Validation**: Test the model on new data
4. **Deployment**: Use the trained model to make predictions

## Types of Machine Learning

### Supervised Learning
- Uses labeled training data
- Examples: classification, regression

### Unsupervised Learning  
- Finds patterns in unlabeled data
- Examples: clustering, dimensionality reduction

### Reinforcement Learning
- Learns through trial and error
- Examples: game playing, robotics

\`\`\`python
# Simple example of a machine learning model
from sklearn.linear_model import LinearRegression

# Create and train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)
\`\`\`

The key is that ML algorithms improve their performance as they are exposed to more data over time!`,
          sender: 'ai',
          timestamp: '2:31 PM'
        }
      ]
    },
    {
      id: '2',
      title: 'React best practices',
      timestamp: '1 day ago',
      messages: [
        {
          id: 'msg-3',
          content: 'What are the best practices for React development?',
          sender: 'user',
          timestamp: '10:15 AM'
        },
        {
          id: 'msg-4',
          content: `# React Best Practices

Here are the essential best practices for React development:

## Component Organization

### Use Functional Components
Prefer functional components with hooks over class components for better performance and simpler code.

### Keep Components Small
Break down large components into smaller, reusable pieces.

\`\`\`jsx
// Good: Small, focused component
const UserAvatar = ({ user }) => (
  <img src={user.avatar} alt={user.name} />
);

// Better: Reusable in multiple places
const Avatar = ({ src, alt, size = 'medium' }) => (
  <img 
    src={src} 
    alt={alt} 
    className={\`avatar avatar-\${size}\`}
  />
);
\`\`\`

## State Management

### Use useState for Local State
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### Use useEffect Properly
\`\`\`jsx
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);
\`\`\`

## Performance Optimization

- **Use React.memo()** for expensive components
- **Implement useMemo()** for expensive calculations
- **Use useCallback()** for event handlers
- **Lazy load** components with React.lazy()

## Code Quality

1. **Use TypeScript** for better type safety
2. **Follow consistent naming** conventions
3. **Write comprehensive tests**
4. **Use ESLint and Prettier**

These practices will help you build maintainable and performant React applications!`,
          sender: 'ai',
          timestamp: '10:16 AM'
        }
      ]
    },
    {
      id: '3',
      title: 'Python vs JavaScript',
      timestamp: '3 days ago',
      messages: [
        {
          id: 'msg-5',
          content: 'What are the main differences between Python and JavaScript?',
          sender: 'user',
          timestamp: '3:45 PM'
        },
        {
          id: 'msg-6',
          content: `# Python vs JavaScript: Key Differences

Both are popular programming languages, but they serve different purposes and have distinct characteristics.

## **Syntax and Readability**

### Python
\`\`\`python
# Python emphasizes readability
def calculate_area(radius):
    return 3.14159 * radius ** 2

# List comprehension
squares = [x**2 for x in range(10)]
\`\`\`

### JavaScript  
\`\`\`javascript
// JavaScript uses curly braces
function calculateArea(radius) {
    return 3.14159 * Math.pow(radius, 2);
}

// Array methods
const squares = Array.from({length: 10}, (_, i) => i**2);
\`\`\`

## **Primary Use Cases**

| Python | JavaScript |
|--------|------------|
| Data Science & AI | Web Development |
| Backend Development | Frontend Development |
| Automation & Scripting | Mobile Apps (React Native) |
| Scientific Computing | Server-side (Node.js) |

## **Execution Environment**

- **Python**: Interpreted language, runs on server/desktop
- **JavaScript**: Originally browser-only, now also server-side with Node.js

## **Learning Curve**

- **Python**: Generally easier for beginners due to clean syntax
- **JavaScript**: More complex due to asynchronous programming and browser quirks

## **Performance**

- **Python**: Slower execution but excellent for prototyping
- **JavaScript**: Faster execution, especially with V8 engine

Choose based on your project needs and career goals!`,
          sender: 'ai',
          timestamp: '3:47 PM'
        }
      ]
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: 'Just now',
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', email);
    setIsLoggedIn(true);
  };

  const handleQuestionSelect = (question: string) => {
    if (!currentChatId) {
      handleNewChat();
    }
    // Wait for next tick to ensure currentChatId is set
    setTimeout(() => {
      handleSendMessage(question);
    }, 0);
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!currentChatId) {
      handleNewChat();
      // Wait for the new chat to be created
      setTimeout(() => {
        handleSendMessage(content, attachments);
      }, 0);
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments?.map(file => ({
        type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
        url: URL.createObjectURL(file),
        name: file.name
      }))
    };

    // Add user message
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            title: chat.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : chat.title
          }
        : chat
    ));

    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        content: generateAIResponse(content),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, aiMessage] }
          : chat
      ));
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = {
      'How does AI work?': `# How AI Works

AI (Artificial Intelligence) works through several key mechanisms:

## Machine Learning
- **Pattern Recognition**: AI systems learn patterns from large datasets
- **Neural Networks**: Inspired by human brain structure, using interconnected nodes
- **Training**: Models are trained on examples to make predictions

## Key Components
1. **Data Processing**: Converting raw data into usable formats
2. **Algorithms**: Mathematical procedures for learning and decision-making
3. **Computation**: Powerful processors handle complex calculations

## Types of AI
- **Narrow AI**: Specialized for specific tasks (like image recognition)
- **General AI**: Hypothetical AI with human-level reasoning across domains

\`\`\`python
# Simple example of a neural network concept
def predict(input_data, weights):
    return sum(x * w for x, w in zip(input_data, weights))
\`\`\`

The field continues to evolve rapidly with advances in **deep learning**, **transformer models**, and **large language models** like the one you're chatting with right now!`,

      'Are black holes real?': `# Black Holes: Scientific Reality

Yes, **black holes are absolutely real**! They're among the most fascinating objects in the universe.

## What Are Black Holes?
Black holes are regions of spacetime where gravity is so strong that nothing - not even light - can escape once it crosses the event horizon.

## Evidence for Their Existence
- **Gravitational Effects**: We observe stars orbiting invisible massive objects
- **X-ray Emissions**: Matter falling into black holes heats up and emits X-rays
- **Gravitational Waves**: LIGO has detected waves from black hole mergers
- **Direct Imaging**: The Event Horizon Telescope captured images of black holes in M87 and our galaxy's center

## Types of Black Holes
1. **Stellar Black Holes**: Formed from collapsed massive stars
2. **Supermassive Black Holes**: Found at galaxy centers, millions of times the sun's mass
3. **Intermediate Black Holes**: Rare, between stellar and supermassive
4. **Primordial Black Holes**: Theoretical, formed in the early universe

The physics of black holes has been confirmed through decades of observation and matches Einstein's predictions remarkably well!`,

      'How many Rs are in the word "strawberry"?': `# Counting Rs in "Strawberry"

Let me count the letter "R" in the word **"strawberry"**:

S-T-R-A-W-B-E-R-R-Y

Looking at each letter:
- Position 3: **R** ✓
- Position 8: **R** ✓  
- Position 9: **R** ✓

**Answer: There are 3 Rs in the word "strawberry".**

This is actually a common example used to test attention to detail and careful letter-by-letter analysis!`,

      'What is the meaning of life?': `# The Meaning of Life: Perspectives

This is one of humanity's oldest and most profound questions. Different perspectives offer various answers:

## Philosophical Views
- **Existentialism**: We create our own meaning through choices and actions
- **Absurdism**: Life may be meaningless, but we can find joy despite this
- **Stoicism**: Meaning comes from virtue, wisdom, and accepting what we cannot control

## Religious Perspectives
- Many faiths propose that meaning comes from relationship with the divine
- Service to others and spiritual growth as central purposes
- The concept of an afterlife giving context to earthly existence

## Scientific/Secular Views
- **Evolution**: Our "purpose" is survival and reproduction
- **Humanism**: Meaning through human flourishing, knowledge, and progress
- **Personal Growth**: Self-actualization and reaching one's potential

## Modern Insights
Research suggests meaning often comes from:
1. **Connection** with others
2. **Purpose** and contributing to something larger
3. **Growth** and learning
4. **Legacy** and positive impact

Perhaps the beauty is that each person can discover their own answer to this timeless question. What gives *your* life meaning?`
    };

    return responses[userMessage as keyof typeof responses] || 
      `Thank you for your question about "${userMessage}". I'd be happy to help you explore this topic further. Could you provide more specific details about what you'd like to know?`;
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="t3-chat-theme">
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onNewChat={handleNewChat}
          chats={chats}
          onChatSelect={handleChatSelect}
          selectedChatId={currentChatId}
          isLoggedIn={isLoggedIn}
          onLogin={() => setShowLoginModal(true)}
        />
        
        <div className="flex-1 flex flex-col">
          {messages.length === 0 && !currentChatId ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
              <DefaultQuestions onQuestionSelect={handleQuestionSelect} />
            </div>
          ) : (
            <ScrollArea className="flex-1 bg-white dark:bg-gray-900">
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-4 p-6 bg-gray-50 dark:bg-gray-800">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">Assistant</div>
                      <div className="text-gray-600 dark:text-gray-400">Thinking...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
          
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      </div>
    </ThemeProvider>
  );
};

export default Index;
