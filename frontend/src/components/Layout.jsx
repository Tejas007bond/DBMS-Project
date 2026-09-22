import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  HeartPulse,
  Pill,
  DoorOpen,
  Calendar,
  Receipt,
  FlaskConical,
  FileText,
  Activity,
  Database,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/nurses', icon: HeartPulse, label: 'Nurses' },
  { to: '/pharmacists', icon: Pill, label: 'Pharmacists' },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/bills', icon: Receipt, label: 'Bills' },
  { to: '/test-reports', icon: FlaskConical, label: 'Test Reports' },
  { to: '/medical-records', icon: FileText, label: 'Medical Records' },
  { to: '/sql', icon: Database, label: 'SQL Explorer' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary-600" />
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">HospitalMS</h1>
              <p className="text-xs text-slate-500">Management System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 text-xs text-slate-400">
          DBMS Project v1.0
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
