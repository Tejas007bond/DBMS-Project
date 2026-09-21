// Seed data for Hospital Management System
// Matches the mock data from frontend/src/data/mockData.js

export const seedData = `
-- ROOMS_B
INSERT INTO ROOMS_B (Capacity, Availability) VALUES
(1, 'Available'),
(2, 'Available'),
(3, 'Full'),
(4, 'Available'),
(5, 'Maintenance');

-- ROOMS
INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES
(101, 1, 'ICU'),
(102, 2, 'General'),
(103, 3, 'General'),
(104, 1, 'Private'),
(105, 4, 'Ward'),
(106, 2, 'Maternity');

-- EMPLOYEE
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Gender, Address, Contact_no, Age) VALUES
(1, 'Gregory', 'House', 'M', '101 Med St, NJ', '555-0101', 50),
(2, 'Derek', 'Shepherd', 'M', '202 Seattle Ave, WA', '555-0102', 45),
(3, 'Allison', 'Cameron', 'F', '303 Clinic Rd, NJ', '555-0103', 32),
(4, 'Stephen', 'Strange', 'M', '177A Bleecker St, NY', '555-0104', 42),
(5, 'Meredith', 'Grey', 'F', '404 Seattle Ave, WA', '555-0105', 38),
(6, 'Carla', 'Espinosa', 'F', '505 Sacred Heart, CA', '555-0106', 35),
(7, 'Jackie', 'Peyton', 'F', '606 All Saints, NY', '555-0107', 40),
(8, 'Rory', 'Williams', 'M', '707 Tardis Ln, UK', '555-0108', 28),
(9, 'Abby', 'Lockhart', 'F', '808 County Gen, IL', '555-0109', 39),
(10, 'Margaret', 'Houlihan', 'F', '909 Mash Camp, KR', '555-0110', 44),
(11, 'Ned', 'Flanders', 'M', '744 Evergreen Ter, SP', '555-0111', 45),
(12, 'Walter', 'White', 'M', '308 Negra Arroyo, NM', '555-0112', 50),
(13, 'Gus', 'Fring', 'M', '121 Los Pollos, NM', '555-0113', 48),
(14, 'Morty', 'Smith', 'M', '101 Sci-Fi Dr, WA', '555-0114', 25),
(15, 'Rick', 'Sanchez', 'M', '102 Sci-Fi Dr, WA', '555-0115', 65);

-- PATIENT_C
INSERT INTO PATIENT_C (Address, Room_no) VALUES
('789 Pine St', 101),
('456 Oak St', 102),
('321 Maple Ave', 103),
('654 Birch Rd', 104),
('987 Cedar Ln', 105),
('111 Willow Dr', 106);

-- PATIENT_B
INSERT INTO PATIENT_B (Phone, Address) VALUES
('555-2001', '789 Pine St'),
('555-2002', '456 Oak St'),
('555-2003', '321 Maple Ave'),
('555-2004', '654 Birch Rd'),
('555-2005', '987 Cedar Ln'),
('555-2006', '111 Willow Dr');

-- PATIENT
INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES
(1001, 'Bruce', 'Wayne', 'M', '555-2001', '2026-09-01', '2026-09-10'),
(1002, 'Clark', 'Kent', 'M', '555-2002', '2026-09-05', NULL),
(1003, 'Diana', 'Prince', 'F', '555-2003', '2026-09-06', NULL),
(1004, 'Barry', 'Allen', 'M', '555-2004', '2026-09-08', NULL),
(1005, 'Arthur', 'Curry', 'M', '555-2005', '2026-09-10', '2026-09-12'),
(1006, 'Victor', 'Stone', 'M', '555-2006', '2026-09-11', NULL);

-- DOCTOR
INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES
(1, 'Diagnostics', 'Head of Dept', NULL),
(2, 'Neurology', 'Senior Consultant', NULL),
(3, 'Immunology', 'Resident', 1),
(4, 'Neurosurgery', 'Attending', 2),
(5, 'General Surgery', 'Resident', 1);

-- NURSE
INSERT INTO NURSE (Emp_id, Shift_type) VALUES
(6, 'Morning'),
(7, 'Night'),
(8, 'Morning'),
(9, 'Night'),
(10, 'Evening');

-- PHARMACIST
INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES
(11, 'Level 1'),
(12, 'Level 2'),
(13, 'Level 1'),
(14, 'Level 3'),
(15, 'Level 2');

-- PERSONS
INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES
(1001, 'Damian Wayne', 'M', 14, 'Son'),
(1001, 'Dick Grayson', 'M', 25, 'Ward'),
(1002, 'Lois Lane', 'F', 32, 'Spouse'),
(1003, 'Hippolyta', 'F', 60, 'Mother'),
(1004, 'Iris West', 'F', 28, 'Spouse'),
(1005, 'Mera', 'F', 30, 'Spouse');

-- TEST_REPORT
INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES
(501, 1001, 'Blood Test', 'Elevated Toxins'),
(502, 1001, 'MRI', 'Minor Bruising'),
(503, 1002, 'X-Ray', 'Indestructible Tissue anomaly'),
(504, 1003, 'ECG', 'Normal'),
(505, 1004, 'Metabolic Panel', 'Hyper-accelerated metabolism'),
(506, 1005, 'Hydration Test', 'Optimal');

-- VALID
INSERT INTO VALID (P_id, Valid) VALUES
(1001, 'Yes'),
(1002, 'Yes'),
(1003, 'No'),
(1004, 'Yes'),
(1005, 'Yes'),
(1006, 'Pending');

-- BILLS
INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES
(801, 1001, 15000.00, 10000.00),
(802, 1002, 1500.00, 1500.00),
(803, 1003, 2000.00, 0.00),
(804, 1004, 3000.00, 2500.00),
(805, 1005, 750.00, 750.00);

-- MEDICAL_RECORDS
INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES
(901, 1001, '2026-09-02'),
(902, 1002, '2026-09-06'),
(903, 1003, '2026-09-07'),
(904, 1004, '2026-09-08'),
(905, 1005, '2026-09-10');

-- RECORD_HANDLER
INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES
(1001, '2026-09-02', 11),
(1002, '2026-09-06', 12),
(1003, '2026-09-07', 13),
(1004, '2026-09-08', 11),
(1005, '2026-09-10', 14);

-- APPOINTMENT
INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES
(2001, '2026-09-01', 1001),
(2002, '2026-09-05', 1002),
(2003, '2026-09-06', 1003),
(2004, '2026-09-08', 1004),
(2005, '2026-09-15', 1006);

-- Appointment_B
INSERT INTO Appointment_B (P_id, D_id) VALUES
(1001, 1),
(1002, 2),
(1003, 4),
(1004, 1),
(1005, 3),
(1006, 5);

-- NURSE_HANDLES_ROOMS
INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES
(6, 101),
(6, 102),
(7, 103),
(8, 104),
(9, 105),
(10, 106),
(8, 101);
`;
