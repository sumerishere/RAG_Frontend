import { Bot, Send, LogOut  } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ChatModel = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const [isPdfOverlayOpen, setIsPdfOverlayOpen] = useState(false);

  const openPdfOverlay = (e) => {
    e.preventDefault();
    setIsPdfOverlayOpen(true);
  };

  const closePdfOverlay = () => {
    setIsPdfOverlayOpen(false);
  };

  // Load previous messages from local storage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message if no previous messages
      setMessages([{
        text: "Hello! I'm your RAG Q&A assistant. Ask me anything about your documents.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Save messages to local storage when they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch list of uploaded documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
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
    
    setMessages([...messages, userMessage, tempAiMessage]);
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
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Success message
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            text: `File "${file.name}" was successfully uploaded and indexed.`, 
            sender: 'system', 
            timestamp: new Date().toISOString() 
          }
        ]);
        // Refresh document list
        fetchDocuments();
      } else {
        // Error message
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            text: `Failed to upload file "${file.name}". Please check the file format.`, 
            sender: 'system', 
            timestamp: new Date().toISOString() 
          }
        ]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          text: 'Error connecting to the server. Please try again later.', 
          sender: 'system', 
          timestamp: new Date().toISOString() 
        }
      ]);
    } finally {
      setLoading(false);
      setUploadedFile(null);
      e.target.value = null; // Reset file input
    }
  };

  const startNewChat = () => {
    setMessages([{
      text: "Hello! I'm your RAG Q&A assistant. Ask me anything about your documents.",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }]);
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

  // Loading animation component
  const LoadingDots = () => (
    <div className="flex space-x-1 mt-1">
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

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
            
            <div className='flex gap-2'>
            <div className="text-xl font-bold">RAG Q&A Assistant</div> 
              <div><Bot /></div>
            </div>
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
          
          {/* Document upload */}
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
          </div>


          {/* Document list */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-medium text-md mb-3 text-gray-300">Your Documents</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {documents.length === 0 ? (
              <div>
                <p className="text-sm text-gray-400 p-3">No user documents uploaded</p>
                {/* Add the default PDF document */}
                <div className="mt-2">
                  <h3 className="text-sm text-gray-300 px-3 pb-2">Available Resources:</h3>
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
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
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
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
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