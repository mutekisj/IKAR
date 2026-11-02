import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import HistoryPage from "./pages/HistoryPage";
import "./App.css";

type Page = "dashboard" | "tasks" | "calendar" | "history";

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
        {activePage === "history" && <HistoryPage />}
        {activePage === "dashboard" && <Dashboard />}
        {activePage === "tasks" && <TasksPage />}
        {activePage === "calendar" && <CalendarPage />}
      </main>
    </div>
  );
}

export default App;