
import DashboardOverview from "./DashboardOverview.jsx";
import Planner from "./Planner.jsx";
import TaskManager from "./TaskManager.jsx";
import Analytics from "./Analytics.jsx";
import Goals from "./Goals.jsx";
import SocialLearning from "./SocialLearning.jsx";
import QuizMaker from "./QuizMaker.jsx";
import MindMap from "./MindMap.jsx";
import CollaborativeNotes from "./CollaborativeNotes.jsx";
import StudyRooms from "./StudyRooms.jsx";
import Badges from "./Badges.jsx";
import ResumeBuilder from "./ResumeBuilder.jsx";
import AIAssistant from "./AIAssistant.jsx";

function StudentDashboard() {
  return (
    <div className="ib-student-dashboard">
      <DashboardOverview materialsCount={"..."} pyqsCount={"..."} seminarsCount={"..."} creditsCount={"..."} streakCount={"..."} hoursCount={"..."} />
      <Planner />
      <TaskManager />
      <Analytics />
      <Goals />
      <SocialLearning />
      <QuizMaker />
      <MindMap />
      <CollaborativeNotes />
      <StudyRooms />
      <Badges />
      <ResumeBuilder />
      <AIAssistant />
    </div>
  );
}

export default StudentDashboard;
