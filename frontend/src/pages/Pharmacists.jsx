import { getPharmacistsWithInfo } from '../data/mockData'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function Pharmacists() {
  const pharmacistsInfo = getPharmacistsWithInfo()

  const columns = [
    { header: 'ID', key: 'Emp_id' },
    { header: 'Name', render: (_, row) => `${row.F_name} ${row.L_name}` },
    { header: 'Clearance Level', key: 'Clearance_level' },
    { header: 'Gender', key: 'Gender' },
    { header: 'Age', key: 'Age' },
    { header: 'Contact', key: 'Contact_no' },
    { header: 'Address', key: 'Address' },
  ]

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
