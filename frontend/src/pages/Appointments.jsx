import { useState, useEffect } from 'react'
import { appointmentsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function Appointments() {
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  async function fetchAppointments() {
    try {
      setLoading(true)
      const data = await appointmentsApi.getAll()
      setEnriched(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { header: 'Appointment ID', key: 'Id' },
    { header: 'Date', key: 'App_date' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Doctor', key: 'Doctor_Name' },
    { header: 'Specialization', key: 'Specialization' },
  ]

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading appointments...</div>
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

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Appointments" subtitle="View all patient-doctor appointments" />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>
    </div>
  )
}
