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
import {
  patients,
  doctors,
  nurses,
  pharmacists,
  rooms,
  appointments,
  bills,
  testReports,
} from '../data/mockData'
import PageHeader from '../components/PageHeader'

const statCards = [
  {
    label: 'Total Patients',
    value: patients.length,
    icon: Users,
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
  },
  {
    label: 'Doctors',
    value: doctors.length,
    icon: Stethoscope,
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
  },
  {
    label: 'Nurses',
    value: nurses.length,
    icon: HeartPulse,
    color: 'bg-purple-500',
    lightBg: 'bg-purple-50',
  },
  {
    label: 'Pharmacists',
    value: pharmacists.length,
    icon: Pill,
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
  },
  {
    label: 'Total Rooms',
    value: rooms.length,
    icon: DoorOpen,
    color: 'bg-cyan-500',
    lightBg: 'bg-cyan-50',
  },
  {
    label: 'Appointments',
    value: appointments.length,
    icon: Calendar,
    color: 'bg-pink-500',
    lightBg: 'bg-pink-50',
  },
]

export default function Dashboard() {
  const inPatients = patients.filter(p => !p.Out_date).length
  const totalBilled = bills.reduce((sum, b) => sum + b.Amount, 0)
  const totalInsurance = bills.reduce((sum, b) => sum + b.I_amount, 0)

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
                <span className="font-semibold text-slate-600">{patients.length - inPatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Patients</span>
                <span className="font-bold text-slate-800">{patients.length}</span>
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Appointments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Patient
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.slice(-5).reverse().map((apt) => {
                  const patient = patients.find(p => p.Patient_id === apt.P_id)
                  return (
                    <tr key={apt.Id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-600">{apt.Id}</td>
                      <td className="px-4 py-2 text-slate-600">{apt.App_date}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium">
                        {patient?.F_name} {patient?.L_name}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Test Reports Summary */}
        <div className="mt-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
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
                {testReports.map((report) => {
                  const patient = patients.find(p => p.Patient_id === report.Patient_id)
                  return (
                    <tr key={report.R_id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-600">{report.R_id}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium">
                        {patient?.F_name} {patient?.L_name}
                      </td>
                      <td className="px-4 py-2 text-slate-600">{report.Test_type}</td>
                      <td className="px-4 py-2 text-slate-600">{report.Result}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
