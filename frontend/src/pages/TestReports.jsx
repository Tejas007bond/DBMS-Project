import { useState, useEffect } from 'react'
import { testReportsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function TestReports() {
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTestReports()
  }, [])

  async function fetchTestReports() {
    try {
      setLoading(true)
      const data = await testReportsApi.getAll()
      setEnriched(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { header: 'Report ID', key: 'R_id' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Test Type', key: 'Test_type' },
    { header: 'Result', key: 'Result' },
  ]

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading test reports...</div>
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
      <PageHeader title="Test Reports" subtitle="View all patient test reports and results" />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>
    </div>
  )
}
