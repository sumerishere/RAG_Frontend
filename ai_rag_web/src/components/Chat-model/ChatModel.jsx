import { Bot, Send, LogOut, History  } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ChatModel = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  // const [uploadedFile, setUploadedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Add state for chat history and current chat ID
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const [isPdfOverlayOpen, setIsPdfOverlayOpen] = useState(false);

  const openPdfOverlay = (e) => {
    e.preventDefault();
    setIsPdfOverlayOpen(true);
  };

  const closePdfOverlay = () => {
    setIsPdfOverlayOpen(false);
  };

  // Update the useEffect that loads chat history
useEffect(() => {
  try {
    const savedChatHistory = localStorage.getItem('chatHistory');
    const savedCurrentChatId = localStorage.getItem('currentChatId');
    
    if (savedChatHistory) {
      const parsedChatHistory = JSON.parse(savedChatHistory);
      
      // Only set chat history if there are actually chats in the saved history
      if (parsedChatHistory && Array.isArray(parsedChatHistory) && parsedChatHistory.length > 0) {
        setChatHistory(parsedChatHistory);
        
        // Set current chat ID from storage or use the first chat in history
        if (savedCurrentChatId && parsedChatHistory.some(chat => chat.id === savedCurrentChatId)) {
          setCurrentChatId(savedCurrentChatId);
        } else {
          setCurrentChatId(parsedChatHistory[0].id);
        }
      } else {
        // If parsed history is empty or invalid, clear localStorage and create new chat
        localStorage.removeItem('currentChatId');
        localStorage.removeItem('chatHistory');
        createNewChat();
      }
    }
  } catch (error) {
    // Handle any parsing errors by clearing localStorage and creating a new chat
    console.error('Error loading chat history:', error);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('currentChatId');
    createNewChat();
  }
}, []);

  // Load messages for current chat
  useEffect(() => {
    if (currentChatId) {
      const currentChat = chatHistory.find(chat => chat.id === currentChatId);
      if (currentChat) {
        setMessages(currentChat.messages);
      }
    }
  }, [currentChatId, chatHistory]);

  // Save chat history to local storage when it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }else{
      localStorage.removeItem('chatHistory');
    }
  }, [chatHistory]);

  // Save current chat ID to local storage when it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
    }
  }, [currentChatId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch list of uploaded documents
  // useEffect(() => {
  //   fetchDocuments();
  // }, []);

  // const fetchDocuments = async () => {
  //   try {
  //     const response = await fetch('http://localhost:8080/api/documents');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setDocuments(data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching documents:', error);
  //   }
  // };

  // Create a new chat with welcome message
  const createNewChat = () => {
    const timestamp = new Date().toISOString();
    const newChatId = `chat_${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: `New Chat - ${chatHistory.length + 1}`,
      timestamp: timestamp,
      messages: [{
        text: "Hello! I'm your RAG Q&A assistant. Ask me anything about your documents.",
        sender: 'ai',
        timestamp: timestamp
      }]
    };
    
    setChatHistory(prevHistory => [newChat, ...prevHistory]);
    setCurrentChatId(newChatId);
    setMessages(newChat.messages);
  };

  // Select a chat from history
  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  // Update chat history when messages change
  const updateChatHistory = (updatedMessages) => {
    setChatHistory(prevHistory => {
      // Find the current chat in history
      return prevHistory.map(chat => {
        if (chat.id === currentChatId) {
          // Update the chat title based on the first user message (if exists)
          const firstUserMessage = updatedMessages.find(msg => msg.sender === 'user');
          const chatTitle = firstUserMessage 
            ? firstUserMessage.text.substring(0, 20) + (firstUserMessage.text.length > 20 ? '...' : '') 
            : `New Chat ${prevHistory.findIndex(c => c.id === currentChatId) + 1}`;
          
          return {
            ...chat,
            messages: updatedMessages,
            title: chatTitle
          };
        }
        return chat;
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
  
    const currentTime = new Date();
    
    // Add user message
    const userMessage = { 
      text: query, 
      sender: 'user', 
      timestamp: currentTime.toISOString() 
    };
    
    // Add temporary AI message with loading state
    const tempAiMessage = { 
      text: "I'm thinking about your question...", 
      sender: 'ai', 
      timestamp: currentTime.toISOString(),
      isLoading: true
    };
    
    const updatedMessages = [...messages, userMessage, tempAiMessage];
    setMessages(updatedMessages);
    // Update chat history with the new messages
    updateChatHistory(updatedMessages);
    
    setQuery('');
    setLoading(true);
  
    try {
      const response = await fetch(`http://localhost:8080/web-ai-rag/chat?query=${encodeURIComponent(query.trim())}`, {
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const rawData = await response.text(); // Get raw text from backend
        
        // Clean up the response
        // Remove any thinking tags and other irrelevant content
        let cleanedResponse = rawData;
        
        // Remove thinking tags if present (Spring AI might include these)
        cleanedResponse = cleanedResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
        
        // Trim extra whitespace
        cleanedResponse = cleanedResponse.trim();
        
        // Replace temporary message with the cleaned response
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const tempIndex = newMessages.findIndex(msg => msg.isLoading);
          if (tempIndex !== -1) {
            newMessages[tempIndex] = { 
              text: cleanedResponse, 
              sender: 'ai', 
              timestamp: new Date().toISOString()
            };
          }
          // Update chat history with the finalized messages
          updateChatHistory(newMessages);
          return newMessages;
        });
      }
  
    } catch (error) {
      console.error('Error:', error);
      // Replace temporary message with connection error
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const tempIndex = newMessages.findIndex(msg => msg.isLoading);
        if (tempIndex !== -1) {
          newMessages[tempIndex] = { 
            text: 'Sorry, I could not connect to the server.', 
            sender: 'ai', 
            timestamp: new Date().toISOString() 
          };
        }
        // Update chat history with the error message
        updateChatHistory(newMessages);
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleFileUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   setUploadedFile(file);
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   try {
  //     setLoading(true);
  //     const response = await fetch('http://localhost:8080/api/upload', {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const successMessage = { 
  //         text: `File "${file.name}" was successfully uploaded and indexed.`, 
  //         sender: 'system', 
  //         timestamp: new Date().toISOString() 
  //       };
        
  //       const updatedMessages = [...messages, successMessage];
  //       setMessages(updatedMessages);
  //       // Update chat history with the success message
  //       updateChatHistory(updatedMessages);
        
  //       // Refresh document list
  //       fetchDocuments();
  //     } else {
  //       const errorMessage = { 
  //         text: `Failed to upload file "${file.name}". Please check the file format.`, 
  //         sender: 'system', 
  //         timestamp: new Date().toISOString() 
  //       };
        
  //       const updatedMessages = [...messages, errorMessage];
  //       setMessages(updatedMessages);
  //       // Update chat history with the error message
  //       updateChatHistory(updatedMessages);
  //     }
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //     const connectionErrorMessage = { 
  //       text: 'Error connecting to the server. Please try again later.', 
  //       sender: 'system', 
  //       timestamp: new Date().toISOString() 
  //     };
      
  //     const updatedMessages = [...messages, connectionErrorMessage];
  //     setMessages(updatedMessages);
  //     // Update chat history with the connection error message
  //     updateChatHistory(updatedMessages);
  //   } finally {
  //     setLoading(false);
  //     setUploadedFile(null);
  //     e.target.value = null; // Reset file input
  //   }
  // };

  const startNewChat = () => {
    createNewChat();
  };

  // Delete a chat from history
const deleteChat = (chatId, e) => {
  e.stopPropagation(); // Prevent triggering the chat selection
  
  setChatHistory(prevHistory => {
    // Filter out the chat to be deleted
    const newHistory = prevHistory.filter(chat => chat.id !== chatId);
    
    // If we're deleting the current chat
    if (chatId === currentChatId) {
      // Clear the current chat ID and messages
      setCurrentChatId(null);
      setMessages([]);
      
      // Remove from localStorage
      localStorage.removeItem('currentChatId');
    }
    
    // Handle empty history case - this is critical for proper cleanup
    if (newHistory.length === 0) {
      // This needs to be done synchronously within this function
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('currentChatId');
    }
    
    return newHistory;
  });
};

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  // Format chat timestamp for sidebar
  const formatChatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Loading animation component
  const LoadingDots = () => (
    <div className="flex space-x-1 mt-1">
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

const EmptyChatState = () => {
  // Animation states using React's useState
  const [isVisible, setIsVisible] = useState(false);
  
  // Use useEffect to trigger the animation after component mount
  useEffect(() => {
    // Small delay before starting animation for better visual effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className=" flex flex-col items-center justify-center h-full text-gray-500 rounded-lg">
      <div className='mb-8'>
        <h2>Hii Dear, Welcome to your RAG AI Q&A Assistant.</h2>
      </div>
      {/* Bot icon with pulse animation */}
      <div className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="relative">
          {/* <Bot size={64} className="text-indigo-400 relative z-10" /> */}
          <img src="/favicon_io/freepik__background__67311.png" alt="icon" className="h-22 w-20 mr-2" />
          <div className="absolute inset-0 bg-indigo-300 rounded-full animate-ping opacity-30"></div>
        </div>
      </div>
      
      {/* Text elements with staggered fade-in */}
      <p className={`text-2xl font-medium mb-2 mt-6 transition-all duration-700 delay-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        No active chat
      </p>
      
      <p className={`text-sm mb-6 text-gray-400 transition-all duration-700 delay-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        Create a new chat to start asking questions
      </p>
      
      {/* Button with fade-in and subtle bounce */}
      <div className={`transition-all duration-700 delay-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button 
          onClick={startNewChat}
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-3 px-6 flex items-center justify-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Start New Chat
        </button>      
      </div>      
    </div>
  );
};

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-3 shadow-md z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-3 p-1 rounded hover:bg-indigo-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
      
            <div className="text-xl font-bold">RAG Q&A Assistant</div>       
          </div>
          <div className="text-sm">
            {new Date().toLocaleString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 ease-in-out overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-gray-700">
            <button 
              onClick={startNewChat}
              className="w-full bg-indigo-500 hover:bg-indigo-700 text-white rounded-md py-2 px-4 flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Chat
            </button>
          </div>
          
          {/* Chat history */}
          <div className="p-4 border-b border-gray-700">
            <div className='flex justify-between items-center'>
              <h2 className="font-medium text-md mb-3 text-gray-300">Chat History </h2>
              <History className="w-4 h-4 mb-1 text-gray-300" />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {chatHistory.length > 0 ? (
                <ul className="space-y-1">
                  {chatHistory.map((chat) => (
                    <li 
                      key={chat.id} 
                      onClick={() => selectChat(chat.id)}
                      className={`text-sm p-2 rounded transition-colors cursor-pointer flex justify-between items-center ${
                        currentChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-gray-300 truncate">{chat.title}</span>
                        <span className="text-xs text-gray-400">{formatChatTimestamp(chat.timestamp)}</span>
                      </div>
                      <button 
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="text-gray-400 hover:text-red-400 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No chat history</p>
              )}
            </div>
          </div>
          
          {/* Document upload
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-medium text-md mb-3 text-gray-300">Upload Document</h2>
            <label className="flex items-center justify-center w-full p-2 border border-gray-600 border-dashed rounded-md cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-sm text-gray-300">Choose file</span>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {uploadedFile && (
              <p className="mt-2 text-sm text-gray-300 truncate">
                {uploadedFile.name}
              </p>
            )}
          </div> */}

          {/* Document list */}
          {/* <div className="p-4 border-b border-gray-700">
            <h2 className="font-medium text-md mb-3 text-gray-300">Your Documents</h2>
          </div> */}
          <div className="flex-1 overflow-y-auto p-2">
            {documents.length === 0 ? (
              <div>
                {/* <p className="text-sm text-gray-400 p-3">No user documents uploaded</p> */}
                {/* Add the default PDF document */}
                <div className="mt-2">
                  <h3 className="text-sm text-gray-300 px-3 pb-2">Available Resource For Guide :</h3>
                  <button 
                    onClick={openPdfOverlay} 
                    className="flex items-center text-sm text-gray-300 p-2 hover:bg-gray-700 rounded transition-colors w-full text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generative-AI-and-LLMs-for-Dummies.pdf
                  </button>
                </div>
              </div>
            ) : (
              <ul className="space-y-1">
                {/* Default PDF document always available */}
                <li className="text-sm text-gray-300 p-2 hover:bg-gray-700 rounded transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <button onClick={openPdfOverlay} className="text-left text-gray-300 hover:text-white">
                    Generative-AI-and-LLMs-for-Dummies.pdf
                  </button>
                </li>
                
                {/* User uploaded documents */}
                {documents.map((doc, index) => (
                  <li key={index} className="text-sm text-gray-300 p-2 hover:bg-gray-700 rounded transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {doc.filename}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className='px-4'>
            <Link to="/login">
              <button className="w-full bg-gray-600 text-md hover:bg-gray-700 text-white rounded-md py-2 px-4 flex items-center justify-center transition-colors">
                Log-Out <span className='ml-2'>< LogOut/></span>
              </button>
            </Link>
          </div>
          <div className='text-sm text-gray-400 p-3 mt-2 mb-5'>
          ©{new Date().getFullYear()} | Developed by Sumer Khan
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col bg-white">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentChatId ? (
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                        <div className="flex-shrink-0 mr-3">
                          <img 
                            src="/favicon_io/freepik__background__67311.png" 
                            alt="AI Assistant" 
                            className="h-8 w-8 rounded-full object-cover border-2 border-indigo-100"
                          />
                        </div>
                    )}
                    <div className={`max-w-xl rounded-lg px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : message.sender === 'system'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {/* Message content */}
                      <div className="text-sm">
                        {message.isLoading ? (
                          <>
                            {message.text}
                            <LoadingDots />
                          </>
                        ) : (
                          <>
                            {message.text}
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-gray-300 text-xs text-gray-600">
                                <p className="font-semibold">Sources:</p>
                                <ul className="mt-1 space-y-1">
                                  {message.sources.map((source, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="mr-1">•</span>
                                      <span>{source}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="text-xs mt-2 opacity-70">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <EmptyChatState />
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent px-3 py-2 focus:outline-none"
                  disabled={loading || !currentChatId} // Disable when there's no current chat
                />
                <button
                  type="submit"
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors ${
                    loading || !currentChatId ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !currentChatId} // Disable when there's no current chat
                ><Send />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                RAG Q&A uses AI to answer questions based on your uploaded documentation
              </div>
            </form>
          </div>
        </main>
      </div>

      {isPdfOverlayOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-11/12 h-[550px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generative-AI-and-LLMs-for-Dummies.pdf</h3>
              <button 
                onClick={closePdfOverlay}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
        
              <iframe
                src="http://localhost:8080/web-ai-rag/generative-ai"
                className="w-full h-full"
                title="Generative AI and LLMs for Dummies"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatModel;