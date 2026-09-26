import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AppBackground from "@/components/ui/AppBackground/AppBackground"
import Landing from "@/components/pages/Landing/Landing"
import Welcome from "@/components/pages/Welcome/Welcome"
import Mimir from "@/components/pages/Mimir/Mimir"
import Day from "@/components/pages/Day/Day"
import Projects from "@/components/pages/Projects/Projects"
import Project from "@/components/pages/Project/Project"
import News from "@/components/pages/News/News"
import Jobs from "@/components/pages/Jobs/Jobs"
import Memory from "@/components/pages/Memory/Memory"
import Documents from "@/components/pages/Documents/Documents"
import Settings from "@/components/pages/Settings/Settings"
import NotFound from "@/components/pages/NotFound/NotFound"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/mimir" element={<Mimir />} />
      <Route path="/day" element={<Day />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<Project />} />
      <Route path="/news" element={<News />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
      <Route path="/settings/:tab" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppBackground />
      <AppRoutes />
    </BrowserRouter>
  )
}
