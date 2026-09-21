import { bills, patients, valid } from '../data/mockData'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

export default function Bills() {
  const enrichedBills = bills.map(b => {
    const patient = patients.find(p => p.Patient_id === b.P_id)
    const validEntry = valid.find(v => v.P_id === b.P_id)
    const coveragePct = b.Amount > 0 ? ((b.I_amount / b.Amount) * 100).toFixed(1) : 0
    return {
      ...b,
      Patient_Name: patient ? `${patient.F_name} ${patient.L_name}` : 'Unknown',
      Coverage: coveragePct,
      Insurance_Valid: validEntry?.Valid || 'Unknown',
    }
  })

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
      render: (_, row) => `${row.Coverage}%`,
    },
    {
      header: 'Insurance Valid',
      render: (_, row) => (
        <StatusBadge
          status={row.Insurance_Valid}
          type={
            row.Insurance_Valid === 'Yes'
              ? 'success'
              : row.Insurance_Valid === 'No'
              ? 'danger'
              : 'warning'
          }
        />
      ),
    },
  ]

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
