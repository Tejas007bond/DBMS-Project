import { useState, useEffect } from 'react'
import { nursesApi } from '../api'
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
  {
    key: 'Shift_type',
    label: 'Shift',
    type: 'select',
    options: ['Morning', 'Evening', 'Night'],
  },
]

export default function Nurses() {
  const [selectedNurse, setSelectedNurse] = useState(null)
  const [nursesInfo, setNursesInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nurseRooms, setNurseRooms] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchNurses()
  }, [])

  useEffect(() => {
    if (selectedNurse) {
      fetchNurseRooms(selectedNurse.Emp_id)
    }
  }, [selectedNurse])

  async function fetchNurses(silent = false) {
    try {
      if (!silent) setLoading(true)
      const data = await nursesApi.getAll()
      setNursesInfo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function handleAdd(values) {
    await nursesApi.create(values)
    await fetchNurses(true)
  }

  async function handleDelete() {
    await nursesApi.delete(deleteTarget.Emp_id)
    await fetchNurses(true)
  }

  async function fetchNurseRooms(nurseId) {
    try {
      const rooms = await nursesApi.getRooms(nurseId)
      setNurseRooms(rooms)
    } catch (err) {
      console.error('Error fetching nurse rooms:', err)
    }
  }

  const columns = [
    { header: 'ID', key: 'Emp_id' },
    { header: 'Name', render: (_, row) => `${row.F_name} ${row.L_name}` },
    { header: 'Shift', key: 'Shift_type' },
    { header: 'Gender', key: 'Gender' },
    { header: 'Age', key: 'Age' },
    { header: 'Contact', key: 'Contact_no' },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedNurse(row)}
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
        <div className="text-slate-500">Loading nurses...</div>
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
      <PageHeader title="Nurses"        subtitle="View all nurses and their shift assignments"
        action={<AddButton label="Add Nurse" onClick={() => setShowAdd(true)} />}
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={nursesInfo} />
        </div>

        {showAdd && (
          <FormModal
            title="Add Nurse"
            fields={formFields}
            onSubmit={handleAdd}
            onClose={() => setShowAdd(false)}
            submitLabel="Add Nurse"
          />
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Delete Nurse"
            message={`Are you sure you want to delete ${deleteTarget.F_name} ${deleteTarget.L_name}? This cannot be undone.`}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}

        {selectedNurse && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
              <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedNurse.F_name} {selectedNurse.L_name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Employee ID: {selectedNurse.Emp_id}</p>
                </div>
                <button
                  onClick={() => setSelectedNurse(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Shift</p>
                    <StatusBadge
                      status={selectedNurse.Shift_type}
                      type={
                        selectedNurse.Shift_type === 'Morning'
                          ? 'success'
                          : selectedNurse.Shift_type === 'Night'
                          ? 'danger'
                          : 'warning'
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Gender</p>
                    <p className="text-sm font-medium text-slate-800">{selectedNurse.Gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Age</p>
                    <p className="text-sm font-medium text-slate-800">{selectedNurse.Age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Contact</p>
                    <p className="text-sm font-medium text-slate-800">{selectedNurse.Contact_no}</p>
                  </div>
                </div>
                {nurseRooms.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Assigned Rooms</p>
                    <div className="bg-slate-50 rounded-lg p-3">
                      {nurseRooms.map((r, i) => (
                        <div key={i} className="flex justify-between py-1.5 border-b border-slate-200 last:border-0">
                          <span className="text-sm text-slate-700">Room {r.Room_no}</span>
                          <span className="text-sm text-slate-500">
                            {r.Room_Type} (Cap: {r.Capacity})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
