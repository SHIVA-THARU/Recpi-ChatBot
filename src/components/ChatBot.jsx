// ChatBot.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatBot.css';

const spoonApi = axios.create({
  baseURL: 'https://api.spoonacular.com/recipes',
  params: {
    apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY
  }
});

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me how to cook something.' }
  ]);
  const [input, setInput] = useState('');
  const [saved, setSaved] = useState(() => {
    const stored = localStorage.getItem('recipes');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(saved));
  }, [saved]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await spoonApi.get('/complexSearch', {
        params: {
          query: input,
          addRecipeInformation: true,
          instructionsRequired: true,
          fillIngredients: true,
          number: 1
        }
      });

      if (response.data.results.length > 0) {
        const recipe = response.data.results[0];

        const ingredientsList = recipe.extendedIngredients
          .map(ing => `- ${ing.original}`)
          .join('\n');

        const tags = [
          recipe.vegetarian ? 'Vegetarian 🥦' : '',
          recipe.vegan ? 'Vegan 🌱' : '',
          recipe.glutenFree ? 'Gluten-Free 🚫' : ''
        ].filter(Boolean).join(' | ');

        const recipeText = `🍽️ ${recipe.title}\n\n🧑‍🍳 Instructions:\n${recipe.instructions || 'Not available'}\n\n📋 Ingredients:\n${ingredientsList}\n\n🏷️ Tags: ${tags || 'None'}`;

        setMessages(prev => [...prev, {
          sender: 'bot',
          text: recipeText
        }]);

        // Save to localStorage
        setSaved(prev => [...prev, {
          title: recipe.title,
          instructions: recipe.instructions,
          ingredients: ingredientsList,
          tags
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: "Sorry, I couldn't find any recipe for that."
        }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Something went wrong. Please try again.'
      }]);
    }

    setInput('');
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <pre>{msg.text}</pre>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Ask about a recipe..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
