import React, { useState } from "react";

function AIAssistant() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm your AI learning assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: "user", text: input }]);
      setInput("");
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: "ai", text: "I'm here to help with your studies. Could you provide more details?" }]);
      }, 1000);
    }
  };
  return (
    <div className="feature-panel" id="ai-assistant-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-robot"></i> AI Learning Assistant</h2>
        <div className="btn-secondary">
          <i className="fas fa-cog"></i> Settings
        </div>
      </div>
      <div className="ai-assistant-container">
        <div className="ai-chat">
          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="ai-input-container">
            <input type="text" className="ai-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me anything..." />
            <button className="ai-send" onClick={sendMessage}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
