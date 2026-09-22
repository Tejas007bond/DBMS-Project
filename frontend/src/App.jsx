import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Doctors from './pages/Doctors'
import Nurses from './pages/Nurses'
import Pharmacists from './pages/Pharmacists'
import Rooms from './pages/Rooms'
import Appointments from './pages/Appointments'
import Bills from './pages/Bills'
import TestReports from './pages/TestReports'
import MedicalRecords from './pages/MedicalRecords'
import SqlExplorer from './pages/SqlExplorer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/nurses" element={<Nurses />} />
          <Route path="/pharmacists" element={<Pharmacists />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/test-reports" element={<TestReports />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/sql" element={<SqlExplorer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
