import { useState, useEffect } from 'react'
import { medicalRecordsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function MedicalRecords() {
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  async function fetchMedicalRecords() {
    try {
      setLoading(true)
      const data = await medicalRecordsApi.getAll()
      setEnriched(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { header: 'Record ID', key: 'R_id' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Purchase Date', key: 'Purchase_date' },
    { header: 'Handled By', key: 'Pharmacist_Name' },
    { header: 'Clearance', key: 'Clearance_level' },
  ]

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading medical records...</div>
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
      <PageHeader
        title="Medical Records"
        subtitle="View medical records and their assigned pharmacists"
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>
    </div>
  )
}
