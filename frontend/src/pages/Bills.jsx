import { useState, useEffect } from 'react'
import { billsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import AddButton from '../components/AddButton'
import DeleteButton from '../components/DeleteButton'
import FormModal from '../components/FormModal'
import ConfirmDialog from '../components/ConfirmDialog'

const formFields = [
  { key: 'B_id', label: 'Bill ID', type: 'number', required: true },
  { key: 'P_id', label: 'Patient ID', type: 'number', required: true },
  { key: 'Amount', label: 'Amount', type: 'number', required: true },
  { key: 'I_amount', label: 'Insurance Amount', type: 'number' },
]

export default function Bills() {
  const [enrichedBills, setEnrichedBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchBills()
  }, [])

  async function fetchBills(silent = false) {
    try {
      if (!silent) setLoading(true)
      const data = await billsApi.getAll()
      setEnrichedBills(data)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function handleAdd(values) {
    await billsApi.create(values)
    await fetchBills(true)
  }

  async function handleDelete() {
    await billsApi.delete(deleteTarget.B_id, deleteTarget.P_id)
    await fetchBills(true)
  }

  const columns = [
    { header: 'Bill ID', key: 'B_id' },
    { header: 'Patient', key: 'Patient_Name' },
    {
      header: 'Amount',
      render: (_, row) => `$${row.Amount.toLocaleString()}`,
    },
    {
      header: 'Insurance',
      render: (_, row) => `$${row.I_amount.toLocaleString()}`,
    },
    {
      header: 'Coverage',
      render: (_, row) => `${row.Insurance_Coverage_Pct}%`,
    },
    {
      header: 'Insurance Valid',
      render: (_, row) => (
        <StatusBadge
          status={row.Valid}
          type={
            row.Valid === 'Yes'
              ? 'success'
              : row.Valid === 'No'
              ? 'danger'
              : 'warning'
          }
        />
      ),
    },
    {
      header: 'Actions',
      render: (_, row) => <DeleteButton onClick={() => setDeleteTarget(row)} />,
    },
  ]

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading bills...</div>
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
        title="Bills"
        subtitle="View all patient bills and insurance coverage"
        action={<AddButton label="Add Bill" onClick={() => setShowAdd(true)} />}
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enrichedBills} />
        </div>
      </div>

      {showAdd && (
        <FormModal
          title="Add Bill"
          fields={formFields}
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
          submitLabel="Add Bill"
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Bill"
          message={`Are you sure you want to delete bill #${deleteTarget.B_id}? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
