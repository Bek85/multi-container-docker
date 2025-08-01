import React, { useState, useRef, useEffect } from 'react';
import './ChatComponent.css';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://172.18.35.123:8000/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'ProkuraturaAI',
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
        id: Date.now() + 1
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="ai-avatar">
            AI
          </div>
          <div className="header-text">
            <h2>AI Assistant</h2>
            <p>How can I help you today?</p>
          </div>
        </div>
        <button className="new-thread-btn">
          New Thread
        </button>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>Start a conversation</h3>
            <p>Ask me anything and I'll help you out</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="message-container">
            {message.role === 'assistant' && (
              <div className="ai-avatar">
                AI
              </div>
            )}

            <div className={`message-content ${message.role === 'user' ? 'user' : ''}`}>
              <div className={`message-bubble ${message.role}`}>
                {message.content}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="user-avatar">
                U
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="loading-container">
            <div className="ai-avatar">
              AI
            </div>
            <div className="loading-bubble">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                className="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message AI Assistant..."
                disabled={isLoading}
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`send-button ${input.trim() ? 'active' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              Send
            </button>
          </div>
        </form>

        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
