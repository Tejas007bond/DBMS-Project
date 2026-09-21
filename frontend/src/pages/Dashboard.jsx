import { useState, useEffect } from 'react'
import {
  Users,
  Stethoscope,
  HeartPulse,
  Pill,
  DoorOpen,
  Calendar,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import { dashboardApi, testReportsApi } from '../api'
import PageHeader from '../components/PageHeader'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [testReports, setTestReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const [statsData, reportsData] = await Promise.all([
        dashboardApi.getStats(),
        testReportsApi.getAll()
      ])
      setStats(statsData)
      setTestReports(reportsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: Users,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
    },
    {
      label: 'Doctors',
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
    },
    {
      label: 'Nurses',
      value: stats?.totalNurses || 0,
      icon: HeartPulse,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50',
    },
    {
      label: 'Pharmacists',
      value: stats?.totalPharmacists || 0,
      icon: Pill,
      color: 'bg-amber-500',
      lightBg: 'bg-amber-50',
    },
    {
      label: 'Total Rooms',
      value: stats?.totalRooms || 0,
      icon: DoorOpen,
      color: 'bg-cyan-500',
      lightBg: 'bg-cyan-50',
    },
    {
      label: 'Appointments',
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: 'bg-pink-500',
      lightBg: 'bg-pink-50',
    },
  ]

  const inPatients = stats?.currentPatients || 0
  const totalPatients = stats?.totalPatients || 0
  const totalBilled = stats?.totalBills || 0
  const totalInsurance = stats?.totalInsurance || 0

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Hospital Management System Overview"
      />
      <div className="p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, lightBg }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`${lightBg} rounded-lg p-3`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Patient Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Currently Admitted</span>
                <span className="font-semibold text-emerald-600">{inPatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Discharged</span>
                <span className="font-semibold text-slate-600">{totalPatients - inPatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Patients</span>
                <span className="font-bold text-slate-800">{totalPatients}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary-600" />
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Billed</span>
                <span className="font-semibold text-slate-800">${totalBilled.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Insurance Covered</span>
                <span className="font-semibold text-emerald-600">${totalInsurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Out of Pocket</span>
                <span className="font-bold text-amber-600">
                  ${(totalBilled - totalInsurance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Reports Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Test Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Report ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Patient
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Test Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testReports.slice(0, 5).map((report) => (
                  <tr key={report.R_id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">{report.R_id}</td>
                    <td className="px-4 py-2 text-slate-700 font-medium">
                      {report.Patient_Name}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{report.Test_type}</td>
                    <td className="px-4 py-2 text-slate-600">{report.Result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
