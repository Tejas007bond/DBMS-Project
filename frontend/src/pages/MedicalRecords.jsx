import {
  medicalRecords,
  recordHandlers,
  patients,
  getEmployeeById,
  pharmacists,
} from '../data/mockData'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function MedicalRecords() {
  const enriched = medicalRecords.map(mr => {
    const patient = patients.find(p => p.Patient_id === mr.P_id)
    const handler = recordHandlers.find(
      rh => rh.P_id === mr.P_id && rh.Purchase_date === mr.Purchase_date
    )
    const pharmacist = handler
      ? pharmacists.find(p => p.Emp_id === handler.Emp_id)
      : null
    const pharmacistEmp = handler ? getEmployeeById(handler.Emp_id) : null

    return {
      ...mr,
      Patient_Name: patient ? `${patient.F_name} ${patient.L_name}` : 'Unknown',
      Pharmacist_Name: pharmacistEmp
        ? `${pharmacistEmp.F_name} ${pharmacistEmp.L_name}`
        : 'N/A',
      Clearance_level: pharmacist?.Clearance_level || 'N/A',
    }
  })

  const columns = [
    { header: 'Record ID', key: 'R_id' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Purchase Date', key: 'Purchase_date' },
    { header: 'Handled By', key: 'Pharmacist_Name' },
    { header: 'Clearance', key: 'Clearance_level' },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader
        title="Medical Records"
        subtitle="View medical records and their assigned pharmacists"
      />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>
    </div>
  )
}
