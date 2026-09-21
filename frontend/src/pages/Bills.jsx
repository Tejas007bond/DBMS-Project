import { useState, useEffect } from 'react'
import { billsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

export default function Bills() {
  const [enrichedBills, setEnrichedBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBills()
  }, [])

  async function fetchBills() {
    try {
      setLoading(true)
      const data = await billsApi.getAll()
      setEnrichedBills(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
      <PageHeader title="Bills" subtitle="View all patient bills and insurance coverage" />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enrichedBills} />
        </div>
      </div>
    </div>
  )
}
