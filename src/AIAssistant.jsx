import React, { useState } from 'react';

const Message = ({ sender, text }) => {
  const isAI = sender === 'ai';
  const style = {
    container: {
      display: 'flex',
      justifyContent: isAI ? 'flex-start' : 'flex-end',
      marginBottom: '12px',
    },
    bubble: {
      maxWidth: '75%',
      padding: '12px 16px',
      borderRadius: 'var(--border-radius-lg)',
      backgroundColor: isAI ? 'var(--fill-secondary)' : 'var(--accent-primary)',
      color: isAI ? 'var(--text-primary)' : 'white',
      lineHeight: 1.5,
    }
  };
  return (
    <div style={style.container}>
      <div style={style.bubble}>{text}</div>
    </div>
  );
};

function AIAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your AI learning assistant. Ask me anything about your coursework." }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
    // Mock AI response
    setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: "That's a great question! Let me look into that for you..." }]);
    }, 1000);
  };

  return (
    <div className="ib-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '24px' }}>AI Assistant</h2>
      <div className="messages" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
        {messages.map((msg, idx) => (
          <Message key={idx} sender={msg.sender} text={msg.text} />
        ))}
      </div>
      <div className="input-area" style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
        />
        <button className="ib-button ib-button-primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default AIAssistant;
