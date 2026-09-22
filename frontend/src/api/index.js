// API service layer for Hospital Management System
// Uses relative URLs - Vite proxy will forward to backend
const API_BASE_URL = '/api';

// Generic fetch helper
async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Dashboard API
export const dashboardApi = {
  getStats: () => fetchApi('/dashboard'),
  getAdmissions: () => fetchApi('/dashboard/admissions'),
  getDischarges: () => fetchApi('/dashboard/discharges'),
};

// Patients API
export const patientsApi = {
  getAll: () => fetchApi('/patients'),
  getById: (id) => fetchApi(`/patients/${id}`),
  create: (patient) => fetchApi('/patients', { method: 'POST', body: JSON.stringify(patient) }),
  update: (id, patient) => fetchApi(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(patient) }),
  delete: (id) => fetchApi(`/patients/${id}`, { method: 'DELETE' }),
  getDependents: (id) => fetchApi(`/patients/${id}/dependents`),
  getConsultations: () => fetchApi('/patients/consultations'),
  getAdmitted: () => fetchApi('/patients/admitted/current'),
};

// Doctors API
export const doctorsApi = {
  getAll: () => fetchApi('/doctors'),
  getById: (id) => fetchApi(`/doctors/${id}`),
  create: (doctor) => fetchApi('/doctors', { method: 'POST', body: JSON.stringify(doctor) }),
  update: (id, doctor) => fetchApi(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(doctor) }),
  delete: (id) => fetchApi(`/doctors/${id}`, { method: 'DELETE' }),
};

// Nurses API
export const nursesApi = {
  getAll: () => fetchApi('/nurses'),
  getById: (id) => fetchApi(`/nurses/${id}`),
  create: (nurse) => fetchApi('/nurses', { method: 'POST', body: JSON.stringify(nurse) }),
  update: (id, nurse) => fetchApi(`/nurses/${id}`, { method: 'PUT', body: JSON.stringify(nurse) }),
  delete: (id) => fetchApi(`/nurses/${id}`, { method: 'DELETE' }),
  getRooms: (id) => fetchApi(`/nurses/${id}/rooms`),
  assignRoom: (id, roomNo) => fetchApi(`/nurses/${id}/rooms`, { method: 'POST', body: JSON.stringify({ Room_no: roomNo }) }),
  removeRoom: (id, roomNo) => fetchApi(`/nurses/${id}/rooms/${roomNo}`, { method: 'DELETE' }),
  getShiftStats: () => fetchApi('/nurses/stats/shifts'),
};

// Pharmacists API
export const pharmacistsApi = {
  getAll: () => fetchApi('/pharmacists'),
  getById: (id) => fetchApi(`/pharmacists/${id}`),
  create: (pharmacist) => fetchApi('/pharmacists', { method: 'POST', body: JSON.stringify(pharmacist) }),
  update: (id, pharmacist) => fetchApi(`/pharmacists/${id}`, { method: 'PUT', body: JSON.stringify(pharmacist) }),
  delete: (id) => fetchApi(`/pharmacists/${id}`, { method: 'DELETE' }),
  getRecords: (id) => fetchApi(`/pharmacists/${id}/records`),
};

// Rooms API
export const roomsApi = {
  getAll: () => fetchApi('/rooms'),
  getByNumber: (roomNo) => fetchApi(`/rooms/${roomNo}`),
  create: (room) => fetchApi('/rooms', { method: 'POST', body: JSON.stringify(room) }),
  update: (roomNo, room) => fetchApi(`/rooms/${roomNo}`, { method: 'PUT', body: JSON.stringify(room) }),
  delete: (roomNo) => fetchApi(`/rooms/${roomNo}`, { method: 'DELETE' }),
  getPatients: (roomNo) => fetchApi(`/rooms/${roomNo}/patients`),
  getNurses: (roomNo) => fetchApi(`/rooms/${roomNo}/nurses`),
};

// Appointments API
export const appointmentsApi = {
  getAll: () => fetchApi('/appointments'),
  getById: (id) => fetchApi(`/appointments/${id}`),
  create: (appointment) => fetchApi('/appointments', { method: 'POST', body: JSON.stringify(appointment) }),
  update: (id, appointment) => fetchApi(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(appointment) }),
  delete: (id) => fetchApi(`/appointments/${id}`, { method: 'DELETE' }),
};

// Bills API
export const billsApi = {
  getAll: () => fetchApi('/bills'),
  getById: (id, patientId) => fetchApi(`/bills/${id}/${patientId}`),
  create: (bill) => fetchApi('/bills', { method: 'POST', body: JSON.stringify(bill) }),
  update: (id, patientId, bill) => fetchApi(`/bills/${id}/${patientId}`, { method: 'PUT', body: JSON.stringify(bill) }),
  delete: (id, patientId) => fetchApi(`/bills/${id}/${patientId}`, { method: 'DELETE' }),
  getAboveAverage: () => fetchApi('/bills/stats/above-average'),
  getPatientSummary: (patientId) => fetchApi(`/bills/patient/${patientId}`),
};

// Test Reports API
export const testReportsApi = {
  getAll: () => fetchApi('/test-reports'),
  getById: (rId, patientId) => fetchApi(`/test-reports/${rId}/${patientId}`),
  create: (report) => fetchApi('/test-reports', { method: 'POST', body: JSON.stringify(report) }),
  update: (rId, patientId, report) => fetchApi(`/test-reports/${rId}/${patientId}`, { method: 'PUT', body: JSON.stringify(report) }),
  delete: (rId, patientId) => fetchApi(`/test-reports/${rId}/${patientId}`, { method: 'DELETE' }),
  getByPatient: (patientId) => fetchApi(`/test-reports/patient/${patientId}`),
};

// Medical Records API
export const medicalRecordsApi = {
  getAll: () => fetchApi('/medical-records'),
  getById: (rId, patientId) => fetchApi(`/medical-records/${rId}/${patientId}`),
  create: (record) => fetchApi('/medical-records', { method: 'POST', body: JSON.stringify(record) }),
  update: (rId, patientId, record) => fetchApi(`/medical-records/${rId}/${patientId}`, { method: 'PUT', body: JSON.stringify(record) }),
  delete: (rId, patientId) => fetchApi(`/medical-records/${rId}/${patientId}`, { method: 'DELETE' }),
  getByPatient: (patientId) => fetchApi(`/medical-records/patient/${patientId}`),
};

// Persons (Dependents) API
export const personsApi = {
  getAll: () => fetchApi('/persons'),
  getByPatientAndName: (patientId, name) => fetchApi(`/persons/${patientId}/${encodeURIComponent(name)}`),
  create: (person) => fetchApi('/persons', { method: 'POST', body: JSON.stringify(person) }),
  update: (patientId, name, person) => fetchApi(`/persons/${patientId}/${encodeURIComponent(name)}`, { method: 'PUT', body: JSON.stringify(person) }),
  delete: (patientId, name) => fetchApi(`/persons/${patientId}/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  getByPatient: (patientId) => fetchApi(`/persons/patient/${patientId}`),
};

// Valid (Insurance) API
export const validApi = {
  getAll: () => fetchApi('/valid'),
  getByPatient: (patientId) => fetchApi(`/valid/${patientId}`),
  create: (valid) => fetchApi('/valid', { method: 'POST', body: JSON.stringify(valid) }),
  update: (patientId, valid) => fetchApi(`/valid/${patientId}`, { method: 'PUT', body: JSON.stringify(valid) }),
  delete: (patientId) => fetchApi(`/valid/${patientId}`, { method: 'DELETE' }),
};

// SQL Explorer API
export const sqlApi = {
  getQueries: ({ verb, endpoint, limit } = {}) => {
    const params = new URLSearchParams();
    if (verb) params.set('verb', verb);
    if (endpoint) params.set('endpoint', endpoint);
    if (limit) params.set('limit', limit);
    const qs = params.toString();
    return fetchApi(`/sql/queries${qs ? `?${qs}` : ''}`);
  },
  clearQueries: () => fetchApi('/sql/queries', { method: 'DELETE' }),
  getTables: () => fetchApi('/sql/tables'),
  getTableRows: (name, { limit = 100, offset = 0 } = {}) =>
    fetchApi(`/sql/tables/${encodeURIComponent(name)}?limit=${limit}&offset=${offset}`),
};

// Employees API
export const employeesApi = {
  getAll: () => fetchApi('/employees'),
  getById: (id) => fetchApi(`/employees/${id}`),
  create: (employee) => fetchApi('/employees', { method: 'POST', body: JSON.stringify(employee) }),
  update: (id, employee) => fetchApi(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(employee) }),
  delete: (id) => fetchApi(`/employees/${id}`, { method: 'DELETE' }),
};
