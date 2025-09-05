import React, { useState } from "react";

function MindMap() {
  const [nodes, setNodes] = useState(["Central Topic"]);
  const [input, setInput] = useState("");

  const addNode = () => {
    if (input) {
      setNodes([...nodes, input]);
      setInput("");
    }
  };

  return (
    <div className="feature-panel" id="mindmap-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-project-diagram"></i> Mind Map</h2>
        <button className="btn-secondary" onClick={addNode}>
          <i className="fas fa-save"></i> Add Node
        </button>
      </div>
      <input type="text" className="form-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Node text" />
      <div>
        <h3>Nodes</h3>
        <ul>
          {nodes.map((node, idx) => (
            <li key={idx}>{node}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MindMap;
