import React, { useState } from "react";


function Goals() {
	const [goals, setGoals] = useState([
		{ title: "Complete Calculus Chapter 5", deadline: "2025-09-15", progress: 60, status: "in-progress" },
		{ title: "Read 50 pages of Physics textbook", deadline: "2025-08-30", progress: 100, status: "completed" }
	]);
	return (
		<div className="ib-dashboard">
			<div className="ib-card">
				<div className="ib-card-icon"><i className="fas fa-bullseye"></i></div>
				<div className="ib-card-title">Study Goals</div>
				<div className="ib-card-content">
					<button className="ib-btn" style={{marginBottom:'1rem'}}>
						<i className="fas fa-plus"></i> Add Goal
					</button>
					<div className="goals-progress">
						<h3>Current Goals</h3>
						<ul>
							{goals.map((goal, idx) => (
								<li key={idx}>
									<strong>{goal.title}</strong> - Due: {goal.deadline} - {goal.progress}% Complete ({goal.status})
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Goals;
