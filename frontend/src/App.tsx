import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ResumeNew from './pages/ResumeNew'
import ResumeEdit from './pages/ResumeEdit'
import JDAnalyzer from './pages/JDAnalyzer'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resumes/new" element={<ResumeNew />} />
        <Route path="/resumes/:id/edit" element={<ResumeEdit />} />
        <Route path="/jd-analyzer" element={<JDAnalyzer />} />
        <Route path="/jd-analyzer/:id" element={<JDAnalyzer />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
