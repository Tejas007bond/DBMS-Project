import { useState, useEffect } from 'react'
import { pharmacistsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
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
    key: 'Clearance_level',
    label: 'Clearance Level',
    type: 'select',
    options: ['Level 1', 'Level 2', 'Level 3'],
  },
]

export default function Pharmacists() {
  const [pharmacistsInfo, setPharmacistsInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchPharmacists()
  }, [])

  async function fetchPharmacists(silent = false) {
    try {
      if (!silent) setLoading(true)
      const data = await pharmacistsApi.getAll()
      setPharmacistsInfo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function handleAdd(values) {
    await pharmacistsApi.create(values)
    await fetchPharmacists(true)
  }

  async function handleDelete() {
    await pharmacistsApi.delete(deleteTarget.Emp_id)
    await fetchPharmacists(true)
  }

  const columns = [
    { header: 'ID', key: 'Emp_id' },
    { header: 'Name', render: (_, row) => `${row.F_name} ${row.L_name}` },
    { header: 'Clearance Level', key: 'Clearance_level' },
    { header: 'Gender', key: 'Gender' },
    { header: 'Age', key: 'Age' },
    { header: 'Contact', key: 'Contact_no' },
    { header: 'Address', key: 'Address' },
    {
      header: 'Actions',
      render: (_, row) => <DeleteButton onClick={() => setDeleteTarget(row)} />,
    },
  ]

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading pharmacists...</div>
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
        title="Pharmacists"
        subtitle="View all pharmacists and their clearance levels"
        action={<AddButton label="Add Pharmacist" onClick={() => setShowAdd(true)} />}
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={pharmacistsInfo} />
        </div>
      </div>

      {showAdd && (
        <FormModal
          title="Add Pharmacist"
          fields={formFields}
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
          submitLabel="Add Pharmacist"
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Pharmacist"
          message={`Are you sure you want to delete ${deleteTarget.F_name} ${deleteTarget.L_name}? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
