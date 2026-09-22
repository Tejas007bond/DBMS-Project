import { useState, useEffect } from 'react'
import { medicalRecordsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import FormModal from '../components/FormModal'
import ConfirmDialog from '../components/ConfirmDialog'

const formFields = [
  { key: 'R_id', label: 'Record ID', type: 'number', required: true },
  { key: 'P_id', label: 'Patient ID', type: 'number', required: true },
  { key: 'Purchase_date', label: 'Purchase Date', type: 'date', required: true },
  { key: 'Emp_id', label: 'Handled By (Pharmacist ID)', type: 'number' },
]

export default function MedicalRecords() {
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  async function fetchMedicalRecords(silent = false) {
    try {
      if (!silent) setLoading(true)
      const data = await medicalRecordsApi.getAll()
      setEnriched(data)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function handleAdd(values) {
    await medicalRecordsApi.create(values)
    await fetchMedicalRecords(true)
  }

  async function handleDelete() {
    await medicalRecordsApi.delete(deleteTarget.R_id, deleteTarget.P_id)
    await fetchMedicalRecords(true)
  }

  const columns = [
    { header: 'Record ID', key: 'R_id' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Purchase Date', key: 'Purchase_date' },
    { header: 'Handled By', key: 'Pharmacist_Name' },
    { header: 'Clearance', key: 'Clearance_level' },
    {
      header: 'Actions',
      render: (_, row) => <DeleteButton onClick={() => setDeleteTarget(row)} />,
    },
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
        action={<AddButton label="Add Medical Record" onClick={() => setShowAdd(true)} />}
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>

      {showAdd && (
        <FormModal
          title="Add Medical Record"
          fields={formFields}
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
          submitLabel="Add Medical Record"
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Medical Record"
          message={`Are you sure you want to delete record #${deleteTarget.R_id}? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
