import { useState, useEffect } from 'react'
import { testReportsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import FormModal from '../components/FormModal'
import ConfirmDialog from '../components/ConfirmDialog'

const formFields = [
  { key: 'R_id', label: 'Report ID', type: 'number', required: true },
  { key: 'Patient_id', label: 'Patient ID', type: 'number', required: true },
  { key: 'Test_type', label: 'Test Type', required: true },
  { key: 'Result', label: 'Result', wide: true },
]

export default function TestReports() {
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchTestReports()
  }, [])

  async function fetchTestReports(silent = false) {
    try {
      if (!silent) setLoading(true)
      const data = await testReportsApi.getAll()
      setEnriched(data)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function handleAdd(values) {
    await testReportsApi.create(values)
    await fetchTestReports(true)
  }

  async function handleDelete() {
    await testReportsApi.delete(deleteTarget.R_id, deleteTarget.Patient_id)
    await fetchTestReports(true)
  }

  const columns = [
    { header: 'Report ID', key: 'R_id' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Test Type', key: 'Test_type' },
    { header: 'Result', key: 'Result' },
    {
      header: 'Actions',
      render: (_, row) => <DeleteButton onClick={() => setDeleteTarget(row)} />,
    },
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
      <PageHeader
        title="Test Reports"
        subtitle="View all patient test reports and results"
        action={<AddButton label="Add Test Report" onClick={() => setShowAdd(true)} />}
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>

      {showAdd && (
        <FormModal
          title="Add Test Report"
          fields={formFields}
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
          submitLabel="Add Test Report"
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Test Report"
          message={`Are you sure you want to delete report #${deleteTarget.R_id}? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
