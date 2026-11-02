-- =======================================================
-- MediTrack - Healthcare Management System
-- MySQL Database Schema & Initial Production Seed Data
-- =======================================================

CREATE DATABASE IF NOT EXISTS meditrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meditrack;

-- --------------------------------------------------------
-- Table: users (Hospital Staff & System Logins)
-- --------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO-INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Clinical Staff',
  department VARCHAR(100) DEFAULT 'General',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: doctors (Specialists, Surgeons, Physicians)
-- --------------------------------------------------------
DROP TABLE IF EXISTS doctors;
CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  qualification VARCHAR(150) NOT NULL,
  experience_years INT NOT NULL DEFAULT 5,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  room_number VARCHAR(50) DEFAULT 'Consultation Suite',
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  availability_status ENUM('Available', 'In Surgery', 'Busy', 'On Leave') NOT NULL DEFAULT 'Available',
  schedule_hours VARCHAR(100) DEFAULT 'Mon-Fri: 09:00 - 16:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: patients (Inpatients, Outpatients, Records)
-- --------------------------------------------------------
DROP TABLE IF EXISTS patients;
CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150),
  address TEXT,
  emergency_contact VARCHAR(255),
  medical_condition VARCHAR(255),
  bed_room VARCHAR(100) DEFAULT 'Outpatient',
  status ENUM('Inpatient', 'Outpatient', 'Discharged') NOT NULL DEFAULT 'Inpatient',
  vitals_bp VARCHAR(20) DEFAULT '120/80',
  vitals_pulse INT DEFAULT 72,
  vitals_temp VARCHAR(20) DEFAULT '98.6 °F',
  vitals_spo2 VARCHAR(10) DEFAULT '99%',
  admission_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: appointments (Patient Scheduling & Tracking)
-- --------------------------------------------------------
DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_code VARCHAR(30) NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  type ENUM('Consultation', 'Follow-up', 'Routine', 'Emergency', 'Pre-Surgery') NOT NULL DEFAULT 'Consultation',
  reason VARCHAR(255),
  notes TEXT,
  status ENUM('Upcoming', 'Completed', 'Rescheduled', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: medical_records (Clinical Encounters & Diagnosis)
-- --------------------------------------------------------
DROP TABLE IF EXISTS medical_records;
CREATE TABLE medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_code VARCHAR(30) NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  visit_date DATE NOT NULL,
  symptoms TEXT NOT NULL,
  diagnosis VARCHAR(255) NOT NULL,
  treatment TEXT,
  lab_tests VARCHAR(255),
  follow_up_date DATE,
  prescriptions_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: medicines (Pharmacy & Inventory)
-- --------------------------------------------------------
DROP TABLE IF EXISTS medicines;
CREATE TABLE medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  generic_name VARCHAR(150),
  category VARCHAR(100) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'Tablets',
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  expiry_date DATE NOT NULL,
  supplier VARCHAR(150),
  min_stock_threshold INT NOT NULL DEFAULT 25,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: billings (Invoices & Revenue Tracking)
-- --------------------------------------------------------
DROP TABLE IF EXISTS billings;
CREATE TABLE billings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_code VARCHAR(30) NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  doctor_id INT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  items_json JSON NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status ENUM('Paid', 'Pending', 'Partially Paid', 'Overdue') NOT NULL DEFAULT 'Pending',
  payment_method VARCHAR(100) DEFAULT 'Insurance / Card',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: beds (Ward Occupancy & Bed Tracking)
-- --------------------------------------------------------
DROP TABLE IF EXISTS beds;
CREATE TABLE beds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ward VARCHAR(100) NOT NULL,
  bed_number VARCHAR(30) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  status ENUM('Available', 'Occupied', 'Maintenance') NOT NULL DEFAULT 'Available',
  patient_id INT,
  patient_name VARCHAR(100),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: activity_logs (System Clinical Audit Trail)
-- --------------------------------------------------------
DROP TABLE IF EXISTS activity_logs;
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  user VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =======================================================
-- INITIAL SAMPLE DATA SEEDING
-- =======================================================

-- Users
INSERT INTO users (id, name, email, password_hash, role, department) VALUES
(1, 'Dr. Alexander Hayes', 'doctor@meditrack.org', '$2b$10$eO0y...hash', 'Chief Medical Officer', 'Cardiology'),
(2, 'Sarah Jenkins', 'admin@meditrack.org', '$2b$10$eO0y...hash', 'Hospital Administrator', 'Administration'),
(3, 'Emily Watson', 'reception@meditrack.org', '$2b$10$eO0y...hash', 'Front Desk Coordinator', 'Outpatient Services');

-- Doctors
INSERT INTO doctors (id, name, specialization, qualification, experience_years, email, phone, room_number, consultation_fee, availability_status, schedule_hours) VALUES
(1, 'Dr. Alexander Hayes', 'Cardiology', 'MD, FACC - Harvard Medical', 16, 'alexander.hayes@meditrack.org', '+1 (555) 234-5671', 'Suite 402 - Heart Wing', 180.00, 'Available', 'Mon-Thu: 08:30 - 15:30'),
(2, 'Dr. Sarah Chen', 'Neurology', 'MD, PhD - Johns Hopkins', 12, 'sarah.chen@meditrack.org', '+1 (555) 234-5672', 'Suite 305 - Neuro Center', 200.00, 'Available', 'Tue-Fri: 09:00 - 16:00'),
(3, 'Dr. Marcus Vance', 'Orthopedics', 'MBBS, MS (Ortho) - Mayo Clinic', 14, 'marcus.vance@meditrack.org', '+1 (555) 234-5673', 'Suite 210 - Bone & Joint', 160.00, 'In Surgery', 'Mon-Wed: 08:00 - 14:00'),
(4, 'Dr. Elena Rostova', 'Pediatrics', 'MD (Pediatrics) - Stanford', 9, 'elena.rostova@meditrack.org', '+1 (555) 234-5674', 'Suite 112 - Childrens Wing', 130.00, 'Available', 'Mon-Fri: 09:00 - 17:00'),
(5, 'Dr. David Kim', 'General Medicine', 'MD, FACP - Columbia Univ', 15, 'david.kim@meditrack.org', '+1 (555) 234-5675', 'Room 101 - Primary Care', 110.00, 'Available', 'Mon-Sat: 08:00 - 16:30'),
(6, 'Dr. Patricia Gomez', 'Oncology', 'MD, Board Certified - Sloan Kettering', 18, 'patricia.gomez@meditrack.org', '+1 (555) 234-5676', 'Suite 501 - Cancer Institute', 240.00, 'On Leave', 'Wed-Fri: 10:00 - 18:00');

-- Patients
INSERT INTO patients (id, patient_code, name, age, gender, blood_group, phone, email, address, emergency_contact, medical_condition, bed_room, status, vitals_bp, vitals_pulse, vitals_temp, vitals_spo2, admission_date) VALUES
(1, 'PT-1001', 'Jonathan Miller', 48, 'Male', 'O+', '+1 (555) 389-1021', 'j.miller@example.com', '742 Evergreen Terr, Springfield', 'Mary Miller (Spouse) +1 555-389-1022', 'Hypertensive Heart Disease', 'Room 302 - Bed A', 'Inpatient', '135/88', 74, '98.6 °F', '98%', '2026-10-28'),
(2, 'PT-1002', 'Clara Oswald', 32, 'Female', 'A+', '+1 (555) 492-3847', 'clara.o@example.com', '128 Baker St, London', 'Danny Pink (Partner) +1 555-492-3849', 'Migraine with Aura', 'Outpatient', 'Outpatient', '118/76', 68, '98.4 °F', '99%', '2026-11-01'),
(3, 'PT-1003', 'Robert Langdon', 56, 'Male', 'B+', '+1 (555) 723-9081', 'r.langdon@harvard.edu', '45 Brattle St, Cambridge', 'Sophie Neveu +1 555-723-9082', 'Meniscal Tear (Right Knee)', 'Room 205 - Bed B', 'Inpatient', '128/82', 80, '99.1 °F', '97%', '2026-10-30'),
(4, 'PT-1004', 'Amelia Pond', 27, 'Female', 'O-', '+1 (555) 601-8392', 'amy.pond@example.com', '14 Leadworth Lane, Inverness', 'Rory Williams (Spouse) +1 555-601-8393', 'Acute Bronchitis', 'Outpatient', 'Outpatient', '112/72', 84, '100.2 °F', '96%', '2026-11-02'),
(5, 'PT-1005', 'Arthur Pendelton', 64, 'Male', 'AB+', '+1 (555) 819-2041', 'arthur.p@example.com', '88 Camelot Way, Avalon', 'Gwen Pendelton +1 555-819-2042', 'Type 2 Diabetes & Neuropathy', 'Room 108 - Bed A', 'Inpatient', '142/90', 78, '98.7 °F', '98%', '2026-10-25'),
(6, 'PT-1006', 'Maya Lin', 8, 'Female', 'A-', '+1 (555) 902-1144', 'lin.family@example.com', '310 Cherry Blossom Way, Seattle', 'Wei Lin (Father) +1 555-902-1145', 'Viral Gastroenteritis', 'Pediatrics Bed 4', 'Inpatient', '100/65', 96, '101.1 °F', '99%', '2026-11-01');

-- Appointments
INSERT INTO appointments (id, appointment_code, patient_id, doctor_id, appointment_date, appointment_time, type, reason, notes, status) VALUES
(1, 'APT-201', 1, 1, '2026-11-02', '09:30 AM', 'Follow-up', 'Review ECG and blood pressure stabilization', 'BP under control; continue Lisinopril 10mg.', 'Completed'),
(2, 'APT-202', 2, 2, '2026-11-02', '11:00 AM', 'Consultation', 'Recurrent temporal headaches with visual aura', 'MRI scheduled for Thursday.', 'Upcoming'),
(3, 'APT-203', 3, 3, '2026-11-02', '01:30 PM', 'Emergency', 'Pre-arthroscopy physical evaluation', 'Ensure fasting from 07:00 AM.', 'Upcoming'),
(4, 'APT-204', 4, 5, '2026-11-02', '03:15 PM', 'Routine', 'Persistent productive cough, fever 3 days', 'Auscultation of chest required.', 'Upcoming');

-- Medical Records
INSERT INTO medical_records (id, record_code, patient_id, doctor_id, visit_date, symptoms, diagnosis, treatment, lab_tests, follow_up_date, prescriptions_json) VALUES
(1, 'REC-501', 1, 1, '2026-10-28', 'Chest tightness upon moderate exertion, shortness of breath', 'Stage 2 Essential Hypertension', 'Commenced beta-blocker and ACE-inhibitor regimen.', 'ECG, Lipid Profile, Serum Creatinine', '2026-11-15', '[{"medicine":"Lisinopril","dosage":"10mg","frequency":"1-0-0","duration":"30 Days"},{"medicine":"Amlodipine","dosage":"5mg","frequency":"0-0-1","duration":"30 Days"}]'),
(2, 'REC-502', 2, 2, '2026-11-01', 'Unilateral throbbing head pain, photophobia, scintillating scotoma', 'Migraine with typical aura (ICD-10 G43.1)', 'Abortive therapy with triptan; lifestyle headache diary.', 'Brain MRI with contrast', '2026-11-20', '[{"medicine":"Sumatriptan","dosage":"50mg","frequency":"As needed at onset","duration":"6 Doses"}]');

-- Medicines
INSERT INTO medicines (id, code, name, generic_name, category, stock_quantity, unit, unit_price, expiry_date, supplier, min_stock_threshold) VALUES
(1, 'MED-001', 'Amoxicillin 500mg', 'Amoxicillin Trihydrate', 'Antibiotics', 140, 'Capsules', 12.50, '2027-08-15', 'Apex BioPharm Ltd', 30),
(2, 'MED-002', 'Lisinopril 10mg', 'Lisinopril Dihydrate', 'Cardiovascular', 85, 'Tablets', 18.00, '2027-04-20', 'Novis Pharma', 25),
(3, 'MED-003', 'Paracetamol 500mg', 'Acetaminophen', 'Analgesics', 420, 'Tablets', 4.50, '2028-01-10', 'Global Care Labs', 50),
(4, 'MED-004', 'Metformin 850mg', 'Metformin Hydrochloride', 'Antidiabetic', 18, 'Tablets', 15.20, '2026-12-05', 'Novis Pharma', 30),
(5, 'MED-005', 'Azithromycin 250mg', 'Azithromycin', 'Antibiotics', 12, 'Tablets', 22.00, '2027-02-14', 'Apex BioPharm Ltd', 20),
(6, 'MED-006', 'Salbutamol Inhaler 100mcg', 'Albuterol Sulfate', 'Respiratory', 45, 'Inhalers', 28.50, '2027-11-30', 'MedAero Technologies', 15),
(7, 'MED-007', 'Omeprazole 20mg', 'Omeprazole', 'Gastrointestinal', 95, 'Capsules', 14.00, '2027-09-18', 'Global Care Labs', 25);

-- Billings
INSERT INTO billings (id, invoice_code, patient_id, doctor_id, invoice_date, due_date, items_json, subtotal, tax_amount, discount_amount, total_amount, payment_status, payment_method, notes) VALUES
(1, 'INV-7801', 1, 1, '2026-10-31', '2026-11-15', '[{"desc":"Cardiology Specialist Consultation","qty":1,"unitPrice":180,"total":180},{"desc":"12-Lead Electrocardiogram","qty":1,"unitPrice":120,"total":120},{"desc":"Inpatient Room Charge","qty":3,"unitPrice":250,"total":750}]', 1088.00, 54.40, 50.00, 1092.40, 'Paid', 'Insurance (BlueCross)', 'Claim #BC-99214 accepted'),
(2, 'INV-7802', 2, 2, '2026-11-01', '2026-11-15', '[{"desc":"Neurology Consultation","qty":1,"unitPrice":200,"total":200},{"desc":"Prescription: Sumatriptan","qty":1,"unitPrice":35,"total":35}]', 235.00, 11.75, 0.00, 246.75, 'Pending', 'Credit Card', 'Awaiting payment');

-- Beds
INSERT INTO beds (id, ward, bed_number, type, status, patient_id, patient_name) VALUES
(1, 'General Ward A', 'GW-101', 'Standard', 'Occupied', 1, 'Jonathan Miller'),
(2, 'General Ward A', 'GW-102', 'Standard', 'Available', NULL, NULL),
(3, 'General Ward A', 'GW-103', 'Standard', 'Available', NULL, NULL),
(4, 'General Ward B', 'GW-201', 'Standard', 'Occupied', 5, 'Arthur Pendelton'),
(5, 'General Ward B', 'GW-202', 'Standard', 'Maintenance', NULL, NULL),
(6, 'Intensive Care Unit (ICU)', 'ICU-01', 'ICU Critical', 'Occupied', 3, 'Robert Langdon'),
(7, 'Intensive Care Unit (ICU)', 'ICU-02', 'ICU Critical', 'Available', NULL, NULL),
(8, 'Pediatric Care', 'PED-01', 'Pediatric Crib', 'Occupied', 6, 'Maya Lin'),
(9, 'Pediatric Care', 'PED-02', 'Pediatric Crib', 'Available', NULL, NULL),
(10, 'Emergency Ward', 'ER-01', 'Trauma Bed', 'Available', NULL, NULL);

-- Activity Logs
INSERT INTO activity_logs (type, text, user) VALUES
('admission', 'Patient Jonathan Miller admitted to Room 302', 'Nurse Sarah'),
('billing', 'Invoice INV-7801 paid via Insurance ($1,092.40)', 'Admin Desk'),
('prescription', 'Prescription issued for Clara Oswald by Dr. Sarah Chen', 'Dr. Sarah Chen');
