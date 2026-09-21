import { useState, useEffect } from 'react'
import { patientsApi, personsApi, testReportsApi, billsApi } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

export default function Patients() {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [patientPersons, setPatientPersons] = useState([])
  const [patientTests, setPatientTests] = useState([])
  const [patientBills, setPatientBills] = useState([])

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDetails(selectedPatient.Patient_id)
    }
  }, [selectedPatient])

  async function fetchPatients() {
    try {
      setLoading(true)
      const data = await patientsApi.getAll()
      setPatients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPatientDetails(patientId) {
    try {
      const [persons, tests, bills] = await Promise.all([
        personsApi.getByPatient(patientId),
        testReportsApi.getByPatient(patientId),
        billsApi.getAll()
      ])
      setPatientPersons(persons)
      setPatientTests(tests)
      setPatientBills(bills.filter(b => b.P_id === patientId))
    } catch (err) {
      console.error('Error fetching patient details:', err)
    }
  }

  const filteredPatients = patients.filter(
    p =>
      `${p.F_name} ${p.L_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.Patient_id.toString().includes(searchTerm)
  )

  const columns = [
    { header: 'ID', key: 'Patient_id' },
    { header: 'Name', render: (_, row) => `${row.F_name} ${row.L_name}` },
    { header: 'Gender', key: 'Gender' },
    { header: 'Phone', key: 'Phone' },
    { header: 'Admitted', key: 'In_date' },
    {
      header: 'Status',
      render: (_, row) => (
        <StatusBadge
          status={row.Out_date ? 'Discharged' : 'Admitted'}
          type={row.Out_date ? 'default' : 'success'}
        />
      ),
    },
    {
      header: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => setSelectedPatient(row)}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          View Details
        </button>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-slate-500">Loading patients...</div>
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
        title="Patients"
        subtitle="Manage and view all hospital patients"
      />
      <div className="p-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={filteredPatients} />
        </div>

        {/* Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedPatient.F_name} {selectedPatient.L_name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Patient ID: {selectedPatient.Patient_id}</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Gender</p>
                    <p className="text-sm font-medium text-slate-800">{selectedPatient.Gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-slate-800">{selectedPatient.Phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Address</p>
                    <p className="text-sm font-medium text-slate-800">{selectedPatient.Address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Room</p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedPatient.Room_no ? `Room ${selectedPatient.Room_no} (${selectedPatient.Room_Type})` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Admission Date</p>
                    <p className="text-sm font-medium text-slate-800">{selectedPatient.In_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Discharge Date</p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedPatient.Out_date || 'Currently Admitted'}
                    </p>
                  </div>
                </div>

                {/* Dependents */}
                {patientPersons.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Dependents</h3>
                    <div className="bg-slate-50 rounded-lg p-3">
                      {patientPersons.map((p, i) => (
                        <div key={i} className="flex justify-between py-1.5 border-b border-slate-200 last:border-0">
                          <span className="text-sm text-slate-700">{p.Name}</span>
                          <span className="text-sm text-slate-500">{p.Relationship} (Age: {p.Age})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Test Reports */}
                {patientTests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Test Reports</h3>
                    <div className="bg-slate-50 rounded-lg p-3">
                      {patientTests.map((t, i) => (
                        <div key={i} className="flex justify-between py-1.5 border-b border-slate-200 last:border-0">
                          <span className="text-sm text-slate-700">{t.Test_type}</span>
                          <span className="text-sm text-slate-500">{t.Result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bills */}
                {patientBills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Bills</h3>
                    <div className="bg-slate-50 rounded-lg p-3">
                      {patientBills.map((b, i) => (
                        <div key={i} className="flex justify-between py-1.5 border-b border-slate-200 last:border-0">
                          <span className="text-sm text-slate-700">Bill #{b.B_id}</span>
                          <span className="text-sm text-slate-500">
                            ${b.Amount.toLocaleString()} (Insurance: ${b.I_amount.toLocaleString()})
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
