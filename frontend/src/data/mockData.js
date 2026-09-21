// Mock data matching the SQL schema from the Hospital Management System

export const roomsB = [
  { Capacity: 1, Availability: 'Available' },
  { Capacity: 2, Availability: 'Available' },
  { Capacity: 3, Availability: 'Full' },
  { Capacity: 4, Availability: 'Available' },
  { Capacity: 5, Availability: 'Maintenance' },
]

export const rooms = [
  { Room_no: 101, Capacity: 1, Type: 'ICU' },
  { Room_no: 102, Capacity: 2, Type: 'General' },
  { Room_no: 103, Capacity: 3, Type: 'General' },
  { Room_no: 104, Capacity: 1, Type: 'Private' },
  { Room_no: 105, Capacity: 4, Type: 'Ward' },
  { Room_no: 106, Capacity: 2, Type: 'Maternity' },
]

export const employees = [
  { Emp_id: 1, F_name: 'Gregory', L_name: 'House', Gender: 'M', Address: '101 Med St, NJ', Contact_no: '555-0101', Age: 50 },
  { Emp_id: 2, F_name: 'Derek', L_name: 'Shepherd', Gender: 'M', Address: '202 Seattle Ave, WA', Contact_no: '555-0102', Age: 45 },
  { Emp_id: 3, F_name: 'Allison', L_name: 'Cameron', Gender: 'F', Address: '303 Clinic Rd, NJ', Contact_no: '555-0103', Age: 32 },
  { Emp_id: 4, F_name: 'Stephen', L_name: 'Strange', Gender: 'M', Address: '177A Bleecker St, NY', Contact_no: '555-0104', Age: 42 },
  { Emp_id: 5, F_name: 'Meredith', L_name: 'Grey', Gender: 'F', Address: '404 Seattle Ave, WA', Contact_no: '555-0105', Age: 38 },
  { Emp_id: 6, F_name: 'Carla', L_name: 'Espinosa', Gender: 'F', Address: '505 Sacred Heart, CA', Contact_no: '555-0106', Age: 35 },
  { Emp_id: 7, F_name: 'Jackie', L_name: 'Peyton', Gender: 'F', Address: '606 All Saints, NY', Contact_no: '555-0107', Age: 40 },
  { Emp_id: 8, F_name: 'Rory', L_name: 'Williams', Gender: 'M', Address: '707 Tardis Ln, UK', Contact_no: '555-0108', Age: 28 },
  { Emp_id: 9, F_name: 'Abby', L_name: 'Lockhart', Gender: 'F', Address: '808 County Gen, IL', Contact_no: '555-0109', Age: 39 },
  { Emp_id: 10, F_name: 'Margaret', L_name: 'Houlihan', Gender: 'F', Address: '909 Mash Camp, KR', Contact_no: '555-0110', Age: 44 },
  { Emp_id: 11, F_name: 'Ned', L_name: 'Flanders', Gender: 'M', Address: '744 Evergreen Ter, SP', Contact_no: '555-0111', Age: 45 },
  { Emp_id: 12, F_name: 'Walter', L_name: 'White', Gender: 'M', Address: '308 Negra Arroyo, NM', Contact_no: '555-0112', Age: 50 },
  { Emp_id: 13, F_name: 'Gus', L_name: 'Fring', Gender: 'M', Address: '121 Los Pollos, NM', Contact_no: '555-0113', Age: 48 },
  { Emp_id: 14, F_name: 'Morty', L_name: 'Smith', Gender: 'M', Address: '101 Sci-Fi Dr, WA', Contact_no: '555-0114', Age: 25 },
  { Emp_id: 15, F_name: 'Rick', L_name: 'Sanchez', Gender: 'M', Address: '102 Sci-Fi Dr, WA', Contact_no: '555-0115', Age: 65 },
]

export const doctors = [
  { Emp_id: 1, Specialization: 'Diagnostics', Designation: 'Head of Dept', Supervisor_id: null },
  { Emp_id: 2, Specialization: 'Neurology', Designation: 'Senior Consultant', Supervisor_id: null },
  { Emp_id: 3, Specialization: 'Immunology', Designation: 'Resident', Supervisor_id: 1 },
  { Emp_id: 4, Specialization: 'Neurosurgery', Designation: 'Attending', Supervisor_id: 2 },
  { Emp_id: 5, Specialization: 'General Surgery', Designation: 'Resident', Supervisor_id: 1 },
]

export const nurses = [
  { Emp_id: 6, Shift_type: 'Morning' },
  { Emp_id: 7, Shift_type: 'Night' },
  { Emp_id: 8, Shift_type: 'Morning' },
  { Emp_id: 9, Shift_type: 'Night' },
  { Emp_id: 10, Shift_type: 'Evening' },
]

export const pharmacists = [
  { Emp_id: 11, Clearance_level: 'Level 1' },
  { Emp_id: 12, Clearance_level: 'Level 2' },
  { Emp_id: 13, Clearance_level: 'Level 1' },
  { Emp_id: 14, Clearance_level: 'Level 3' },
  { Emp_id: 15, Clearance_level: 'Level 2' },
]

export const patientC = [
  { Address: '789 Pine St', Room_no: 101 },
  { Address: '456 Oak St', Room_no: 102 },
  { Address: '321 Maple Ave', Room_no: 103 },
  { Address: '654 Birch Rd', Room_no: 104 },
  { Address: '987 Cedar Ln', Room_no: 105 },
  { Address: '111 Willow Dr', Room_no: 106 },
]

export const patientB = [
  { Phone: '555-2001', Address: '789 Pine St' },
  { Phone: '555-2002', Address: '456 Oak St' },
  { Phone: '555-2003', Address: '321 Maple Ave' },
  { Phone: '555-2004', Address: '654 Birch Rd' },
  { Phone: '555-2005', Address: '987 Cedar Ln' },
  { Phone: '555-2006', Address: '111 Willow Dr' },
]

export const patients = [
  { Patient_id: 1001, F_name: 'Bruce', L_name: 'Wayne', Gender: 'M', Phone: '555-2001', In_date: '2026-09-01', Out_date: '2026-09-10' },
  { Patient_id: 1002, F_name: 'Clark', L_name: 'Kent', Gender: 'M', Phone: '555-2002', In_date: '2026-09-05', Out_date: null },
  { Patient_id: 1003, F_name: 'Diana', L_name: 'Prince', Gender: 'F', Phone: '555-2003', In_date: '2026-09-06', Out_date: null },
  { Patient_id: 1004, F_name: 'Barry', L_name: 'Allen', Gender: 'M', Phone: '555-2004', In_date: '2026-09-08', Out_date: null },
  { Patient_id: 1005, F_name: 'Arthur', L_name: 'Curry', Gender: 'M', Phone: '555-2005', In_date: '2026-09-10', Out_date: '2026-09-12' },
  { Patient_id: 1006, F_name: 'Victor', L_name: 'Stone', Gender: 'M', Phone: '555-2006', In_date: '2026-09-11', Out_date: null },
]

export const persons = [
  { Patient_id: 1001, Name: 'Damian Wayne', Sex: 'M', Age: 14, Relationship: 'Son' },
  { Patient_id: 1001, Name: 'Dick Grayson', Sex: 'M', Age: 25, Relationship: 'Ward' },
  { Patient_id: 1002, Name: 'Lois Lane', Sex: 'F', Age: 32, Relationship: 'Spouse' },
  { Patient_id: 1003, Name: 'Hippolyta', Sex: 'F', Age: 60, Relationship: 'Mother' },
  { Patient_id: 1004, Name: 'Iris West', Sex: 'F', Age: 28, Relationship: 'Spouse' },
  { Patient_id: 1005, Name: 'Mera', Sex: 'F', Age: 30, Relationship: 'Spouse' },
]

export const testReports = [
  { R_id: 501, Patient_id: 1001, Test_type: 'Blood Test', Result: 'Elevated Toxins' },
  { R_id: 502, Patient_id: 1001, Test_type: 'MRI', Result: 'Minor Bruising' },
  { R_id: 503, Patient_id: 1002, Test_type: 'X-Ray', Result: 'Indestructible Tissue anomaly' },
  { R_id: 504, Patient_id: 1003, Test_type: 'ECG', Result: 'Normal' },
  { R_id: 505, Patient_id: 1004, Test_type: 'Metabolic Panel', Result: 'Hyper-accelerated metabolism' },
  { R_id: 506, Patient_id: 1005, Test_type: 'Hydration Test', Result: 'Optimal' },
]

export const valid = [
  { P_id: 1001, Valid: 'Yes' },
  { P_id: 1002, Valid: 'Yes' },
  { P_id: 1003, Valid: 'No' },
  { P_id: 1004, Valid: 'Yes' },
  { P_id: 1005, Valid: 'Yes' },
  { P_id: 1006, Valid: 'Pending' },
]

export const bills = [
  { B_id: 801, P_id: 1001, Amount: 15000.00, I_amount: 10000.00 },
  { B_id: 802, P_id: 1002, Amount: 1500.00, I_amount: 1500.00 },
  { B_id: 803, P_id: 1003, Amount: 2000.00, I_amount: 0.00 },
  { B_id: 804, P_id: 1004, Amount: 3000.00, I_amount: 2500.00 },
  { B_id: 805, P_id: 1005, Amount: 750.00, I_amount: 750.00 },
]

export const medicalRecords = [
  { R_id: 901, P_id: 1001, Purchase_date: '2026-09-02' },
  { R_id: 902, P_id: 1002, Purchase_date: '2026-09-06' },
  { R_id: 903, P_id: 1003, Purchase_date: '2026-09-07' },
  { R_id: 904, P_id: 1004, Purchase_date: '2026-09-08' },
  { R_id: 905, P_id: 1005, Purchase_date: '2026-09-10' },
]

export const recordHandlers = [
  { P_id: 1001, Purchase_date: '2026-09-02', Emp_id: 11 },
  { P_id: 1002, Purchase_date: '2026-09-06', Emp_id: 12 },
  { P_id: 1003, Purchase_date: '2026-09-07', Emp_id: 13 },
  { P_id: 1004, Purchase_date: '2026-09-08', Emp_id: 11 },
  { P_id: 1005, Purchase_date: '2026-09-10', Emp_id: 14 },
]

export const appointments = [
  { Id: 2001, App_date: '2026-09-01', P_id: 1001 },
  { Id: 2002, App_date: '2026-09-05', P_id: 1002 },
  { Id: 2003, App_date: '2026-09-06', P_id: 1003 },
  { Id: 2004, App_date: '2026-09-08', P_id: 1004 },
  { Id: 2005, App_date: '2026-09-15', P_id: 1006 },
]

export const appointmentB = [
  { P_id: 1001, D_id: 1 },
  { P_id: 1002, D_id: 2 },
  { P_id: 1003, D_id: 4 },
  { P_id: 1004, D_id: 1 },
  { P_id: 1005, D_id: 3 },
  { P_id: 1006, D_id: 5 },
]

export const nurseHandlesRooms = [
  { Emp_id: 6, Room_no: 101 },
  { Emp_id: 6, Room_no: 102 },
  { Emp_id: 7, Room_no: 103 },
  { Emp_id: 8, Room_no: 104 },
  { Emp_id: 9, Room_no: 105 },
  { Emp_id: 10, Room_no: 106 },
  { Emp_id: 8, Room_no: 101 },
]

// Helper: get employee by ID
export const getEmployeeById = (id) => employees.find(e => e.Emp_id === id)

// Helper: get doctor with employee info
export const getDoctorsWithInfo = () =>
  doctors.map(d => ({
    ...d,
    ...getEmployeeById(d.Emp_id),
    Supervisor_Name: d.Supervisor_id
      ? `${getEmployeeById(d.Supervisor_id).F_name} ${getEmployeeById(d.Supervisor_id).L_name}`
      : null,
  }))

// Helper: get nurse with employee info
export const getNursesWithInfo = () =>
  nurses.map(n => ({
    ...n,
    ...getEmployeeById(n.Emp_id),
  }))

// Helper: get pharmacist with employee info
export const getPharmacistsWithInfo = () =>
  pharmacists.map(p => ({
    ...p,
    ...getEmployeeById(p.Emp_id),
  }))

// Helper: get patient address and room
export const getPatientDetails = (patientId) => {
  const patient = patients.find(p => p.Patient_id === patientId)
  if (!patient) return null
  const b = patientB.find(pb => pb.Phone === patient.Phone)
  const c = b ? patientC.find(pc => pc.Address === b.Address) : null
  const room = c ? rooms.find(r => r.Room_no === c.Room_no) : null
  return {
    ...patient,
    Address: b?.Address || null,
    Room_no: c?.Room_no || null,
    Room_Type: room?.Type || null,
    Room_Availability: roomsB.find(rb => rb.Capacity === room?.Capacity)?.Availability || null,
  }
}

// Helper: get patient with consultation info
export const getPatientConsultations = () =>
  appointmentB.map(ab => {
    const patient = patients.find(p => p.Patient_id === ab.P_id)
    const doctor = doctors.find(d => d.Emp_id === ab.D_id)
    const doctorEmp = getEmployeeById(ab.D_id)
    return {
      Patient_id: ab.P_id,
      Patient_Name: `${patient?.F_name} ${patient?.L_name}`,
      Doctor_Name: `${doctorEmp?.F_name} ${doctorEmp?.L_name}`,
      Specialization: doctor?.Specialization,
    }
  })
