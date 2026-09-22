import { useState, useEffect } from 'react'
import { appointmentsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import FormModal from '../components/FormModal'
import ConfirmDialog from '../components/ConfirmDialog'

const formFields = [
  { key: 'Id', label: 'Appointment ID', type: 'number', required: true },
  { key: 'App_date', label: 'Date', type: 'date' },
  { key: 'P_id', label: 'Patient ID', type: 'number', required: true },
  { key: 'D_id', label: 'Doctor ID', type: 'number' },
]

export default function Appointments() {
  const [enriched, setEnriched] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  async function fetchAppointments(silent = false) {
    try {
      if (!silent) setLoading(true)
      const data = await appointmentsApi.getAll()
      setEnriched(data)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function handleAdd(values) {
    await appointmentsApi.create(values)
    await fetchAppointments(true)
  }

  async function handleDelete() {
    await appointmentsApi.delete(deleteTarget.Id)
    await fetchAppointments(true)
  }

  const columns = [
    { header: 'Appointment ID', key: 'Id' },
    { header: 'Date', key: 'App_date' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Doctor', key: 'Doctor_Name' },
    { header: 'Specialization', key: 'Specialization' },
    {
      header: 'Actions',
      render: (_, row) => <DeleteButton onClick={() => setDeleteTarget(row)} />,
    },
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
      <PageHeader
        title="Appointments"
        subtitle="View all patient-doctor appointments"
        action={<AddButton label="Add Appointment" onClick={() => setShowAdd(true)} />}
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>

      {showAdd && (
        <FormModal
          title="Add Appointment"
          fields={formFields}
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
          submitLabel="Add Appointment"
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Appointment"
          message={`Are you sure you want to delete appointment #${deleteTarget.Id}? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
