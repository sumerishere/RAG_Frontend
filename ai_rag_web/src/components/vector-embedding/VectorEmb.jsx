
import React, { useState } from 'react';

const VectorEmbedding = () => {
  const [userQuery, setUserQuery] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState([
    { text: "How to fix a bicycle", vector: [0.6, 0.2, 0.4, 0.7, 0.3] },
    { text: "Bike repair tips", vector: [0.5, 0.3, 0.5, 0.8, 0.2] },
    { text: "Best pizza recipes", vector: [-0.5, 0.7, 0.3, -0.2, 0.6] },
    { text: "How to make pizza dough", vector: [-0.6, 0.8, 0.2, -0.3, 0.7] },
    { text: "Science fair projects", vector: [0.1, -0.5, 0.9, 0.2, -0.4] }
  ]);
  const [newText, setNewText] = useState('');
  const [queryVector, setQueryVector] = useState(null);
  const [similarityScores, setSimilarityScores] = useState([]);
  const [animationState, setAnimationState] = useState('idle'); // idle, converting, comparing, results
  const [comparingIndex, setComparingIndex] = useState(-1);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // milliseconds

  // Simple random vector generator that creates vectors similar to the themes
  const generateVector = (text) => {
    // Very simplified "embedding" - just for demonstration
    let baseVector;
    text = text.toLowerCase();
    
    if (text.includes('bike') || text.includes('bicycle') || text.includes('fix') || text.includes('repair')) {
      baseVector = [0.5, 0.2, 0.4, 0.7, 0.3]; // Bike-related
    } else if (text.includes('pizza') || text.includes('food') || text.includes('recipe')) {
      baseVector = [-0.5, 0.7, 0.3, -0.2, 0.6]; // Food-related
    } else if (text.includes('science') || text.includes('project') || text.includes('experiment')) {
      baseVector = [0.1, -0.5, 0.9, 0.2, -0.4]; // Science-related
    } else {
      baseVector = [0, 0, 0, 0, 0]; // Neutral
      // Add some randomness for unknown topics
      return baseVector.map(() => Math.random() * 2 - 1);
    }
    
    // Add some small random variations
    return baseVector.map(v => v + (Math.random() * 0.2 - 0.1));
  };

  // Calculate similarity between two vectors (cosine similarity)
  const calculateSimilarity = (vec1, vec2) => {
    // Simple version of cosine similarity for educational purposes
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }
    
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    
    return dotProduct / (mag1 * mag2);
  };

  // Search function with animated steps
  const searchQuery = async () => {
    if (!userQuery.trim()) return;
    
    // Reset any previous search results
    setSimilarityScores([]);
    setComparingIndex(-1);
    
    // Step 1: Converting to vector
    setAnimationState('converting');
    const vector = generateVector(userQuery);
    setQueryVector(vector);
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    // Step 2: Compare with each item in database
    setAnimationState('comparing');
    
    const tempScores = [];
    
    // Compare with each item one by one (for animation)
    for (let i = 0; i < knowledgeBase.length; i++) {
      setComparingIndex(i);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      const similarity = calculateSimilarity(vector, knowledgeBase[i].vector);
      const percentSimilarity = Math.round((similarity + 1) / 2 * 100);
      
      tempScores.push({
        text: knowledgeBase[i].text,
        similarity: percentSimilarity,
        vector: knowledgeBase[i].vector,
        index: i
      });
    }
    
    // Step 3: Show results
    tempScores.sort((a, b) => b.similarity - a.similarity);
    setSimilarityScores(tempScores);
    setAnimationState('results');
  };

  // Add new text to knowledge base
  const addToKnowledgeBase = () => {
    if (!newText.trim()) return;
    
    const newVector = generateVector(newText);
    
    // Add to knowledge base
    const newItem = { text: newText, vector: newVector };
    setKnowledgeBase([...knowledgeBase, newItem]);
    setNewText('');
  };

  // Reset animation
  const resetAnimation = () => {
    setAnimationState('idle');
    setQueryVector(null);
    setSimilarityScores([]);
    setComparingIndex(-1);
  };

  // For the 2D vector space visualization (simplified 2D projection)
  const projectTo2D = (vector) => {
    // Very simplified projection to 2D
    // Taking first dimension as x and second as y
    // In reality, dimensionality reduction is much more complex
    let x = vector[0] * 100 + 200; // Scale and center
    let y = vector[1] * 100 + 150; // Scale and center
    return { x, y };
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Vector Search Animation</h1>
      
      {/* Knowledge Base */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Knowledge Base</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {knowledgeBase.map((item, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${
                comparingIndex === index 
                  ? 'bg-yellow-100 border-yellow-400 shadow-md' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <p className="font-medium">{item.text}</p>
              <div className="mt-2 flex items-center">
                <span className="text-xs font-mono">Vector: </span>
                <div className="flex ml-1">
                  {item.vector.map((v, i) => (
                    <span 
                      key={i} 
                      className={`inline-block w-6 h-6 mx-1 rounded-full ${
                        animationState === 'comparing' && comparingIndex === index 
                          ? 'animate-pulse' 
                          : ''
                      }`}
                      style={{
                        backgroundColor: v > 0 ? `rgba(0, 0, 255, ${Math.abs(v)})` : `rgba(255, 0, 0, ${Math.abs(v)})`,
                        border: '1px solid #ccc'
                      }} 
                      title={v.toFixed(2)}
                    ></span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add to Knowledge Base */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Add New Information</h2>
        <div className="flex">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter new text (e.g., 'How to make a volcano')"
            className="flex-1 p-2 border border-gray-300 rounded-l"
          />
          <button 
            onClick={addToKnowledgeBase}
            className="px-4 py-2 bg-green-600 text-white rounded-r hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Search</h2>
        <div className="flex">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Enter your question (e.g., 'How do I fix my bike?')"
            className="flex-1 p-2 border border-gray-300 rounded-l"
            disabled={animationState !== 'idle'}
          />
          <button 
            onClick={searchQuery}
            className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
            disabled={animationState !== 'idle'}
          >
            Search
          </button>
        </div>
      </div>
      
      {/* Animation speed control */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Animation Speed</h3>
        <div className="flex items-center">
          <span className="mr-2">Fast</span>
          <input 
            type="range" 
            min="500" 
            max="2000" 
            step="100" 
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="ml-2">Slow</span>
        </div>
      </div>
      
      {/* Vector Space Visualization */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Vector Space Visualization</h2>
        <div className="relative bg-white border border-gray-300 rounded-lg" style={{height: '300px'}}>
          {/* Axes */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300"></div>
          <div className="absolute bottom-0 top-0 left-1/2 w-px bg-gray-300"></div>
          
          {/* Knowledge base points */}
          {knowledgeBase.map((item, index) => {
            const pos = projectTo2D(item.vector);
            return (
              <div 
                key={index}
                className={`absolute w-4 h-4 rounded-full flex items-center justify-center
                  ${comparingIndex === index ? 'ring-2 ring-yellow-400 z-20' : 'z-10'}
                  ${animationState === 'comparing' && comparingIndex === index ? 'animate-ping' : ''}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  transform: 'translate(-50%, -50%)'
                }}
                title={item.text}
              >
                <span className="absolute whitespace-nowrap text-xs bg-white px-1 rounded opacity-70 -mt-6">
                  {index + 1}
                </span>
              </div>
            );
          })}
          
          {/* Query point */}
          {queryVector && (
            <div 
              className={`absolute w-5 h-5 rounded-full bg-red-500 z-30 
                ${animationState === 'converting' ? 'animate-pulse' : ''}`}
              style={{
                left: `${projectTo2D(queryVector).x}px`,
                top: `${projectTo2D(queryVector).y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <span className="absolute whitespace-nowrap text-xs bg-white px-1 rounded opacity-70 -mt-6">
                Your query
              </span>
            </div>
          )}
          
          {/* Connection lines */}
          {queryVector && animationState === 'comparing' && comparingIndex >= 0 && (
            <svg className="absolute top-0 left-0 w-full h-full z-0">
              <line 
                x1={projectTo2D(queryVector).x} 
                y1={projectTo2D(queryVector).y} 
                x2={projectTo2D(knowledgeBase[comparingIndex].vector).x} 
                y2={projectTo2D(knowledgeBase[comparingIndex].vector).y} 
                style={{ stroke: 'rgba(234, 179, 8, 0.6)', strokeWidth: 2, strokeDasharray: '5,5' }} 
              />
            </svg>
          )}
          
          {/* Results connections */}
          {queryVector && animationState === 'results' && similarityScores.length > 0 && (
            <svg className="absolute top-0 left-0 w-full h-full z-0">
              {similarityScores.map((score, idx) => (
                <line 
                  key={idx}
                  x1={projectTo2D(queryVector).x} 
                  y1={projectTo2D(queryVector).y} 
                  x2={projectTo2D(score.vector).x} 
                  y2={projectTo2D(score.vector).y} 
                  style={{ 
                    stroke: idx === 0 ? 'rgba(22, 163, 74, 0.8)' : 'rgba(156, 163, 175, 0.4)', 
                    strokeWidth: idx === 0 ? 3 : 1 
                  }} 
                />
              ))}
            </svg>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">This is a simplified 2D view of the 5D vector space. Points that are closer together are more similar.</p>
      </div>

{/* Animation Status */}
<div className="mb-6">
  <h2 className="text-xl font-bold mb-3">What's Happening</h2>
  <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-24">
    {animationState === 'idle' && (
      <p>Enter a search query and click "Search" to start the animation.</p>
    )}
    
    {animationState === 'converting' && (
      <div>
        <h3 className="font-bold text-blue-600">Step 1: Converting your question to a vector</h3>
        <div className="mt-2 flex items-center justify-center">
          <div className="p-2 bg-blue-50 rounded border border-blue-200">"{userQuery}"</div>
          <div className="mx-4 text-2xl animate-bounce">→</div>
          <div className="flex">
            {queryVector && queryVector.map((v, i) => (
              <span 
                key={i} 
                className="inline-block w-6 h-6 mx-1 rounded-full animate-pulse" 
                style={{
                  backgroundColor: v > 0 ? `rgba(0, 0, 255, ${Math.abs(v)})` : `rgba(255, 0, 0, ${Math.abs(v)})`,
                  border: '1px solid #ccc',
                  animationDelay: `${i * 0.1}s`
                }}
                title={v.toFixed(2)}
              ></span>
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-sm">Your question is being turned into numbers that computers understand!</p>
      </div>
    )}
    
    {animationState === 'comparing' && (
      <div>
        <h3 className="font-bold text-yellow-600">Step 2: Finding similar information</h3>
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0">
            <p className="text-sm">Comparing with:</p>
            <p className="font-medium">{comparingIndex >= 0 ? knowledgeBase[comparingIndex].text : ""}</p>
          </div>
          <div className="text-xl mx-4">⟷</div>
          <div className="text-sm">
            <span>Measuring how similar these are...</span>
            <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-sm">Look at the moving line in the vector space - it shows the distance between your question and this item!</p>
      </div>
    )}
    
    {animationState === 'results' && similarityScores.length > 0 && (
      <div>
        <h3 className="font-bold text-green-600">Step 3: Results found!</h3>
        <p className="text-sm mb-2">Here are the most similar items:</p>
        <ol className="list-decimal pl-5">
          {similarityScores.slice(0, 2).map((score, idx) => (
            <li key={idx} className={`font-medium ${idx === 0 ? 'text-green-700' : ''}`}>
              {score.text} ({score.similarity}% similar)
              {idx === 0 && <span className="ml-2 text-sm text-green-600">← Best match!</span>}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-center text-sm">Notice how the closest items in vector space are the most similar in meaning!</p>
        <div className="mt-3 text-center">
          <button 
            onClick={resetAnimation}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Try Another Search
          </button>
        </div>
      </div>
    )}
  </div>
</div>

{/* Simple Explanation */}
<div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
    <h2 className="text-xl font-bold mb-2">How This Works (Kid-Friendly)</h2>
    <ol className="list-decimal pl-5 space-y-1">
        <li>Each text is turned into a set of numbers (a vector)</li>
        <li>Similar meaning = similar numbers</li>
        <li>We place these in a space where closer = more similar</li>
        <li>When you search, we find the closest neighbors!</li>
    </ol>
    <p className="mt-3 text-sm">This is how AI systems like ChatGPT understand that "bicycle repair" and "fixing my bike" mean almost the same thing!</p>
    </div>
</div>
);
} 
export default VectorEmbedding;