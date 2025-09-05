import React, { useState } from "react";

function Analytics() {
	const [progress, setProgress] = useState({
		mathematics: 85,
		physics: 72,
		chemistry: 91,
		computerScience: 78
	});
	return (
		<div className="ib-dashboard">
			<div className="ib-card">
				<div className="ib-card-icon"><i className="fas fa-chart-line"></i></div>
				<div className="ib-card-title">Progress Analytics</div>
				<div className="ib-card-content">
					<div className="chart-title" style={{color:'#FFD700',fontWeight:700,marginBottom:'1rem'}}>Study Progress</div>
					{Object.entries(progress).map(([subject, value]) => (
						<div key={subject} style={{ marginBottom: 20 }}>
							<div className="progress-label" style={{display:'flex',justifyContent:'space-between'}}>
								<span className="progress-text">{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
								<span className="progress-value">{value}%</span>
							</div>
							<div className="progress-bar" style={{background:'#222',borderRadius:8,overflow:'hidden',height:12}}>
								<div className="progress-fill" style={{ width: `${value}%`, background:'#FFD700', height:12, borderRadius:8, transition:'width 0.5s'}}></div>
							</div>
						</div>
					))}
				</div>
				<button className="ib-btn" style={{marginTop:'1rem'}}><i className="fas fa-download"></i> Export Report</button>
			</div>
		</div>
	);
}

export default Analytics;
