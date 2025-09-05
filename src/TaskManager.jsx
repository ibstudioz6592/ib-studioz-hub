import React, { useState } from "react";


function TaskManager() {
	const [tasks, setTasks] = useState([]);
	const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "high" });

	const handleChange = e => {
		setForm({ ...form, [e.target.id]: e.target.value });
	};

	const handleAddTask = () => {
		if (form.title && form.dueDate) {
			setTasks([...tasks, { ...form, completed: false, id: Date.now() }]);
			setForm({ title: "", description: "", dueDate: "", priority: "high" });
		}
	};

	const toggleTask = idx => {
		setTasks(tasks.map((task, i) => i === idx ? { ...task, completed: !task.completed } : task));
	};

	return (
		<div className="ib-dashboard">
			<div className="ib-card">
				<div className="ib-card-icon"><i className="fas fa-tasks"></i></div>
				<div className="ib-card-title">Task Manager</div>
				<div className="ib-card-content">
					<div className="task-input" style={{marginBottom:'1.5rem'}}>
						<input type="text" className="form-input" id="title" placeholder="Task title" value={form.title} onChange={handleChange} />
						<textarea className="form-textarea" id="description" placeholder="Task description" value={form.description} onChange={handleChange} />
						<input type="date" className="form-input" id="dueDate" value={form.dueDate} onChange={handleChange} />
						<select className="form-input" id="priority" value={form.priority} onChange={handleChange}>
							<option value="high">High</option>
							<option value="medium">Medium</option>
							<option value="low">Low</option>
						</select>
						<button className="ib-btn" onClick={handleAddTask} style={{marginTop:'0.5rem'}}>
							<i className="fas fa-plus"></i> Add Task
						</button>
					</div>
					<div className="task-list">
						<h3>Your Tasks</h3>
						<ul>
							{tasks.map((task, idx) => (
								<li key={task.id}>
									<input type="checkbox" checked={task.completed} onChange={() => toggleTask(idx)} />
									{task.title} - {task.dueDate} ({task.priority})
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TaskManager;
