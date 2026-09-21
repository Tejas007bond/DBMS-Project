import { testReports, patients } from '../data/mockData'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function TestReports() {
  const enriched = testReports.map(tr => {
    const patient = patients.find(p => p.Patient_id === tr.Patient_id)
    return {
      ...tr,
      Patient_Name: patient ? `${patient.F_name} ${patient.L_name}` : 'Unknown',
    }
  })

  const columns = [
    { header: 'Report ID', key: 'R_id' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Test Type', key: 'Test_type' },
    { header: 'Result', key: 'Result' },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Test Reports" subtitle="View all patient test reports and results" />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>
    </div>
  )
}
