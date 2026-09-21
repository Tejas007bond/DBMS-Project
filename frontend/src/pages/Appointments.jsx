import { appointments, patients, getPatientConsultations } from '../data/mockData'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function Appointments() {
  const consultations = getPatientConsultations()

  // Merge appointment dates with consultation info
  const enriched = appointments.map(apt => {
    const consult = consultations.find(c => c.Patient_id === apt.P_id)
    return {
      ...apt,
      Patient_Name: consult?.Patient_Name || 'Unknown',
      Doctor_Name: consult?.Doctor_Name || 'Unknown',
      Specialization: consult?.Specialization || 'N/A',
    }
  })

  const columns = [
    { header: 'Appointment ID', key: 'Id' },
    { header: 'Date', key: 'App_date' },
    { header: 'Patient', key: 'Patient_Name' },
    { header: 'Doctor', key: 'Doctor_Name' },
    { header: 'Specialization', key: 'Specialization' },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Appointments" subtitle="View all patient-doctor appointments" />
      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={enriched} />
        </div>
      </div>
    </div>
  )
}
