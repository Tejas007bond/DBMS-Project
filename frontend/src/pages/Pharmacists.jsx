import { useState, useEffect } from 'react'
import { pharmacistsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function Pharmacists() {
  const [pharmacistsInfo, setPharmacistsInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPharmacists()
  }, [])

  async function fetchPharmacists() {
    try {
      setLoading(true)
      const data = await pharmacistsApi.getAll()
      setPharmacistsInfo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { header: 'ID', key: 'Emp_id' },
    { header: 'Name', render: (_, row) => `${row.F_name} ${row.L_name}` },
    { header: 'Clearance Level', key: 'Clearance_level' },
    { header: 'Gender', key: 'Gender' },
    { header: 'Age', key: 'Age' },
    { header: 'Contact', key: 'Contact_no' },
    { header: 'Address', key: 'Address' },
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
      <PageHeader title="Pharmacists" subtitle="View all pharmacists and their clearance levels" />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={pharmacistsInfo} />
        </div>
      </div>
    </div>
  )
}
