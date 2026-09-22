import { useState, useEffect } from 'react'
import { doctorsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import FormModal from '../components/FormModal'
import ConfirmDialog from '../components/ConfirmDialog'

const formFields = [
  { key: 'Emp_id', label: 'Employee ID', type: 'number', required: true },
  { key: 'F_name', label: 'First Name', required: true },
  { key: 'L_name', label: 'Last Name', required: true },
  { key: 'Gender', label: 'Gender', type: 'select', options: ['M', 'F'] },
  { key: 'Age', label: 'Age', type: 'number' },
  { key: 'Contact_no', label: 'Contact No', placeholder: '555-0000' },
  { key: 'Address', label: 'Address', wide: true },
  { key: 'Specialization', label: 'Specialization' },
  { key: 'Designation', label: 'Designation' },
  { key: 'Supervisor_id', label: 'Supervisor ID', type: 'number' },
]

export default function Doctors() {
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [doctorsInfo, setDoctorsInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  async function fetchDoctors(silent = false) {
    try {
      if (!silent) setLoading(true)
      const data = await doctorsApi.getAll()
      setDoctorsInfo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function handleAdd(values) {
    await doctorsApi.create(values)
    await fetchDoctors(true)
  }

  async function handleDelete() {
    await doctorsApi.delete(deleteTarget.Emp_id)
    await fetchDoctors(true)
  }

  const columns = [
    { header: 'ID', key: 'Emp_id' },
    { header: 'Name', render: (_, row) => `${row.F_name} ${row.L_name}` },
    { header: 'Specialization', key: 'Specialization' },
    { header: 'Designation', key: 'Designation' },
    { header: 'Supervisor', render: (_, row) => row.Supervisor_Name || '—' },
    { header: 'Gender', key: 'Gender' },
    { header: 'Age', key: 'Age' },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedDoctor(row)}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            View Details
          </button>
          <DeleteButton onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading doctors...</div>
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
        title="Doctors"
        subtitle="View all doctors and their specializations"
        action={<AddButton label="Add Doctor" onClick={() => setShowAdd(true)} />}
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={doctorsInfo} />
        </div>

        {showAdd && (
          <FormModal
            title="Add Doctor"
            fields={formFields}
            onSubmit={handleAdd}
            onClose={() => setShowAdd(false)}
            submitLabel="Add Doctor"
          />
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Delete Doctor"
            message={`Are you sure you want to delete Dr. ${deleteTarget.F_name} ${deleteTarget.L_name}? This cannot be undone.`}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}

        {selectedDoctor && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
              <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Dr. {selectedDoctor.F_name} {selectedDoctor.L_name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Employee ID: {selectedDoctor.Emp_id}</p>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Specialization</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDoctor.Specialization}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Designation</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDoctor.Designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Gender</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDoctor.Gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Age</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDoctor.Age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDoctor.Contact_no}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Address</p>
                    <p className="text-sm font-medium text-slate-800">{selectedDoctor.Address}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Supervisor</p>
                  <StatusBadge
                    status={selectedDoctor.Supervisor_Name || 'None (Senior)'}
                    type={selectedDoctor.Supervisor_Name ? 'info' : 'success'}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
