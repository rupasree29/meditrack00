/**
 * MediTrack - Core Client-Side Data Store
 * Supports both standalone offline operation via localStorage (double-click index.html)
 * and seamless synchronization with the Node.js + MySQL backend when running.
 */

(function (window) {
  'use strict';

  var STORAGE_KEY = 'meditrack_system_data_v2';
  var AUTH_KEY = 'meditrack_current_user';

  // Realistic sample seed data for standalone operation
  var initialData = {
    doctors: [
      {
        id: 1,
        name: "Dr. Alexander Hayes",
        specialization: "Cardiology",
        qualification: "MD, FACC - Harvard Medical",
        experienceYears: 16,
        email: "alexander.hayes@meditrack.org",
        phone: "+1 (555) 234-5671",
        roomNumber: "Suite 402 - Heart Wing",
        consultationFee: 180,
        availabilityStatus: "Available",
        scheduleHours: "Mon-Thu: 08:30 - 15:30",
        avatar: "AH"
      },
      {
        id: 2,
        name: "Dr. Sarah Chen",
        specialization: "Neurology",
        qualification: "MD, PhD - Johns Hopkins",
        experienceYears: 12,
        email: "sarah.chen@meditrack.org",
        phone: "+1 (555) 234-5672",
        roomNumber: "Suite 305 - Neuro Center",
        consultationFee: 200,
        availabilityStatus: "Available",
        scheduleHours: "Tue-Fri: 09:00 - 16:00",
        avatar: "SC"
      },
      {
        id: 3,
        name: "Dr. Marcus Vance",
        specialization: "Orthopedics",
        qualification: "MBBS, MS (Ortho) - Mayo Clinic",
        experienceYears: 14,
        email: "marcus.vance@meditrack.org",
        phone: "+1 (555) 234-5673",
        roomNumber: "Suite 210 - Bone & Joint",
        consultationFee: 160,
        availabilityStatus: "In Surgery",
        scheduleHours: "Mon-Wed: 08:00 - 14:00",
        avatar: "MV"
      },
      {
        id: 4,
        name: "Dr. Elena Rostova",
        specialization: "Pediatrics",
        qualification: "MD (Pediatrics) - Stanford",
        experienceYears: 9,
        email: "elena.rostova@meditrack.org",
        phone: "+1 (555) 234-5674",
        roomNumber: "Suite 112 - Children's Wing",
        consultationFee: 130,
        availabilityStatus: "Available",
        scheduleHours: "Mon-Fri: 09:00 - 17:00",
        avatar: "ER"
      },
      {
        id: 5,
        name: "Dr. David Kim",
        specialization: "General Medicine",
        qualification: "MD, FACP - Columbia Univ",
        experienceYears: 15,
        email: "david.kim@meditrack.org",
        phone: "+1 (555) 234-5675",
        roomNumber: "Room 101 - Primary Care",
        consultationFee: 110,
        availabilityStatus: "Available",
        scheduleHours: "Mon-Sat: 08:00 - 16:30",
        avatar: "DK"
      },
      {
        id: 6,
        name: "Dr. Patricia Gomez",
        specialization: "Oncology",
        qualification: "MD, Board Certified - Sloan Kettering",
        experienceYears: 18,
        email: "patricia.gomez@meditrack.org",
        phone: "+1 (555) 234-5676",
        roomNumber: "Suite 501 - Cancer Institute",
        consultationFee: 240,
        availabilityStatus: "On Leave",
        scheduleHours: "Wed-Fri: 10:00 - 18:00",
        avatar: "PG"
      }
    ],

    patients: [
      {
        id: 1,
        patientCode: "PT-1001",
        name: "Jonathan Miller",
        age: 48,
        gender: "Male",
        bloodGroup: "O+",
        phone: "+1 (555) 389-1021",
        email: "j.miller@example.com",
        address: "742 Evergreen Terr, Springfield",
        emergencyContact: "Mary Miller (Spouse) +1 (555) 389-1022",
        medicalCondition: "Hypertensive Heart Disease",
        bedRoom: "Room 302 - Bed A",
        status: "Inpatient",
        admissionDate: "2026-10-28",
        vitals: { bp: "135/88", pulse: 74, temp: "98.6 °F", spo2: "98%" }
      },
      {
        id: 2,
        patientCode: "PT-1002",
        name: "Clara Oswald",
        age: 32,
        gender: "Female",
        bloodGroup: "A+",
        phone: "+1 (555) 492-3847",
        email: "clara.o@example.com",
        address: "128 Baker St, London",
        emergencyContact: "Danny Pink (Partner) +1 (555) 492-3849",
        medicalCondition: "Migraine with Aura",
        bedRoom: "Outpatient",
        status: "Outpatient",
        admissionDate: "2026-11-01",
        vitals: { bp: "118/76", pulse: 68, temp: "98.4 °F", spo2: "99%" }
      },
      {
        id: 3,
        patientCode: "PT-1003",
        name: "Robert Langdon",
        age: 56,
        gender: "Male",
        bloodGroup: "B+",
        phone: "+1 (555) 723-9081",
        email: "r.langdon@harvard.edu",
        address: "45 Brattle St, Cambridge",
        emergencyContact: "Sophie Neveu +1 (555) 723-9082",
        medicalCondition: "Meniscal Tear (Right Knee)",
        bedRoom: "Room 205 - Bed B",
        status: "Inpatient",
        admissionDate: "2026-10-30",
        vitals: { bp: "128/82", pulse: 80, temp: "99.1 °F", spo2: "97%" }
      },
      {
        id: 4,
        patientCode: "PT-1004",
        name: "Amelia Pond",
        age: 27,
        gender: "Female",
        bloodGroup: "O-",
        phone: "+1 (555) 601-8392",
        email: "amy.pond@example.com",
        address: "14 Leadworth Lane, Inverness",
        emergencyContact: "Rory Williams (Spouse) +1 (555) 601-8393",
        medicalCondition: "Acute Bronchitis",
        bedRoom: "Outpatient",
        status: "Outpatient",
        admissionDate: "2026-11-02",
        vitals: { bp: "112/72", pulse: 84, temp: "100.2 °F", spo2: "96%" }
      },
      {
        id: 5,
        patientCode: "PT-1005",
        name: "Arthur Pendelton",
        age: 64,
        gender: "Male",
        bloodGroup: "AB+",
        phone: "+1 (555) 819-2041",
        email: "arthur.p@example.com",
        address: "88 Camelot Way, Avalon",
        emergencyContact: "Gwen Pendelton +1 (555) 819-2042",
        medicalCondition: "Type 2 Diabetes & Neuropathy",
        bedRoom: "Room 108 - Bed A",
        status: "Inpatient",
        admissionDate: "2026-10-25",
        vitals: { bp: "142/90", pulse: 78, temp: "98.7 °F", spo2: "98%" }
      },
      {
        id: 6,
        patientCode: "PT-1006",
        name: "Maya Lin",
        age: 8,
        gender: "Female",
        bloodGroup: "A-",
        phone: "+1 (555) 902-1144",
        email: "lin.family@example.com",
        address: "310 Cherry Blossom Way, Seattle",
        emergencyContact: "Wei Lin (Father) +1 (555) 902-1145",
        medicalCondition: "Viral Gastroenteritis",
        bedRoom: "Pediatrics Bed 4",
        status: "Inpatient",
        admissionDate: "2026-11-01",
        vitals: { bp: "100/65", pulse: 96, temp: "101.1 °F", spo2: "99%" }
      },
      {
        id: 7,
        patientCode: "PT-1007",
        name: "Grace Hopper",
        age: 72,
        gender: "Female",
        bloodGroup: "B-",
        phone: "+1 (555) 345-6789",
        email: "grace.h@navy.mil",
        address: "100 Naval Base Rd, Annapolis",
        emergencyContact: "Thomas Hopper +1 (555) 345-6780",
        medicalCondition: "Post-op Hip Arthroplasty",
        bedRoom: "Discharged",
        status: "Discharged",
        admissionDate: "2026-10-15",
        vitals: { bp: "124/78", pulse: 70, temp: "98.4 °F", spo2: "98%" }
      }
    ],

    appointments: [
      {
        id: 1,
        appointmentCode: "APT-201",
        patientId: 1,
        patientName: "Jonathan Miller",
        doctorId: 1,
        doctorName: "Dr. Alexander Hayes",
        department: "Cardiology",
        date: "2026-11-02",
        time: "09:30 AM",
        type: "Follow-up",
        reason: "Review ECG and blood pressure stabilization",
        status: "Completed",
        notes: "BP under control; continue Lisinopril 10mg."
      },
      {
        id: 2,
        appointmentCode: "APT-202",
        patientId: 2,
        patientName: "Clara Oswald",
        doctorId: 2,
        doctorName: "Dr. Sarah Chen",
        department: "Neurology",
        date: "2026-11-02",
        time: "11:00 AM",
        type: "Consultation",
        reason: "Recurrent temporal headaches with visual aura",
        status: "Upcoming",
        notes: "MRI scheduled for Thursday."
      },
      {
        id: 3,
        appointmentCode: "APT-203",
        patientId: 3,
        patientName: "Robert Langdon",
        doctorId: 3,
        doctorName: "Dr. Marcus Vance",
        department: "Orthopedics",
        date: "2026-11-02",
        time: "01:30 PM",
        type: "Emergency",
        reason: "Pre-arthroscopy physical evaluation",
        status: "Upcoming",
        notes: "Ensure fasting from 07:00 AM."
      },
      {
        id: 4,
        appointmentCode: "APT-204",
        patientId: 4,
        patientName: "Amelia Pond",
        doctorId: 5,
        doctorName: "Dr. David Kim",
        department: "General Medicine",
        date: "2026-11-02",
        time: "03:15 PM",
        type: "Checkup",
        reason: "Persistent productive cough, fever 3 days",
        status: "Upcoming",
        notes: "Auscultation of chest required."
      },
      {
        id: 5,
        appointmentCode: "APT-205",
        patientId: 6,
        patientName: "Maya Lin",
        doctorId: 4,
        doctorName: "Dr. Elena Rostova",
        department: "Pediatrics",
        date: "2026-11-03",
        time: "10:00 AM",
        type: "Follow-up",
        reason: "Pediatric hydration and electrolyte recovery",
        status: "Upcoming",
        notes: "Review stool culture results."
      },
      {
        id: 6,
        appointmentCode: "APT-206",
        patientId: 5,
        patientName: "Arthur Pendelton",
        doctorId: 5,
        doctorName: "Dr. David Kim",
        department: "General Medicine",
        date: "2026-11-04",
        time: "02:00 PM",
        type: "Routine",
        reason: "HbA1c quarterly review & foot exam",
        status: "Upcoming",
        notes: "Fasting lipid panel ordered."
      }
    ],

    medicalRecords: [
      {
        id: 1,
        recordCode: "REC-501",
        patientId: 1,
        patientName: "Jonathan Miller",
        doctorId: 1,
        doctorName: "Dr. Alexander Hayes",
        visitDate: "2026-10-28",
        symptoms: "Chest tightness upon moderate exertion, shortness of breath",
        diagnosis: "Stage 2 Essential Hypertension with mild LV strain",
        treatment: "Commenced beta-blocker and ACE-inhibitor regimen. Low-sodium diet advised.",
        prescriptions: [
          { medicine: "Lisinopril", dosage: "10mg", frequency: "1-0-0 (Morning)", duration: "30 Days" },
          { medicine: "Amlodipine", dosage: "5mg", frequency: "0-0-1 (Night)", duration: "30 Days" }
        ],
        labTests: "ECG, Lipid Profile, Serum Creatinine",
        followUpDate: "2026-11-15"
      },
      {
        id: 2,
        recordCode: "REC-502",
        patientId: 2,
        patientName: "Clara Oswald",
        doctorId: 2,
        doctorName: "Dr. Sarah Chen",
        visitDate: "2026-11-01",
        symptoms: "Unilateral throbbing head pain, photophobia, scintillating scotoma",
        diagnosis: "Migraine with typical aura (ICD-10 G43.1)",
        treatment: "Abortive therapy with triptan; lifestyle headache diary initiated.",
        prescriptions: [
          { medicine: "Sumatriptan", dosage: "50mg", frequency: "As needed at onset", duration: "6 Doses" },
          { medicine: "Naproxen", dosage: "250mg", frequency: "1-0-1 (With meals)", duration: "5 Days" }
        ],
        labTests: "Brain MRI with contrast (Scheduled)",
        followUpDate: "2026-11-20"
      },
      {
        id: 3,
        recordCode: "REC-503",
        patientId: 3,
        patientName: "Robert Langdon",
        doctorId: 3,
        doctorName: "Dr. Marcus Vance",
        visitDate: "2026-10-30",
        symptoms: "Sharp medial right knee pain, joint locking during pivot",
        diagnosis: "Complex tear of posterior horn of medial meniscus",
        treatment: "Arthroscopic partial meniscectomy planned. Cryotherapy and joint brace applied.",
        prescriptions: [
          { medicine: "Celecoxib", dosage: "200mg", frequency: "1-0-0 (Morning)", duration: "14 Days" },
          { medicine: "Paracetamol", dosage: "500mg", frequency: "1-1-1", duration: "7 Days" }
        ],
        labTests: "Right Knee MRI, CBC, Coagulation Screen",
        followUpDate: "2026-11-08"
      }
    ],

    medicines: [
      {
        id: 1,
        code: "MED-001",
        name: "Amoxicillin 500mg",
        genericName: "Amoxicillin Trihydrate",
        category: "Antibiotics",
        stockQuantity: 140,
        unit: "Capsules",
        unitPrice: 12.50,
        expiryDate: "2027-08-15",
        supplier: "Apex BioPharm Ltd",
        minStockThreshold: 30
      },
      {
        id: 2,
        code: "MED-002",
        name: "Lisinopril 10mg",
        genericName: "Lisinopril Dihydrate",
        category: "Cardiovascular",
        stockQuantity: 85,
        unit: "Tablets",
        unitPrice: 18.00,
        expiryDate: "2027-04-20",
        supplier: "Novis Pharma",
        minStockThreshold: 25
      },
      {
        id: 3,
        code: "MED-003",
        name: "Paracetamol 500mg",
        genericName: "Acetaminophen",
        category: "Analgesics",
        stockQuantity: 420,
        unit: "Tablets",
        unitPrice: 4.50,
        expiryDate: "2028-01-10",
        supplier: "Global Care Labs",
        minStockThreshold: 50
      },
      {
        id: 4,
        code: "MED-004",
        name: "Metformin 850mg",
        genericName: "Metformin Hydrochloride",
        category: "Antidiabetic",
        stockQuantity: 18, // LOW STOCK ALERT
        unit: "Tablets",
        unitPrice: 15.20,
        expiryDate: "2026-12-05", // EXPIRING SOON
        supplier: "Novis Pharma",
        minStockThreshold: 30
      },
      {
        id: 5,
        code: "MED-005",
        name: "Azithromycin 250mg",
        genericName: "Azithromycin",
        category: "Antibiotics",
        stockQuantity: 12, // LOW STOCK ALERT
        unit: "Tablets",
        unitPrice: 22.00,
        expiryDate: "2027-02-14",
        supplier: "Apex BioPharm Ltd",
        minStockThreshold: 20
      },
      {
        id: 6,
        code: "MED-006",
        name: "Salbutamol Inhaler 100mcg",
        genericName: "Albuterol Sulfate",
        category: "Respiratory",
        stockQuantity: 45,
        unit: "Inhalers",
        unitPrice: 28.50,
        expiryDate: "2027-11-30",
        supplier: "MedAero Technologies",
        minStockThreshold: 15
      },
      {
        id: 7,
        code: "MED-007",
        name: "Omeprazole 20mg",
        genericName: "Omeprazole",
        category: "Gastrointestinal",
        stockQuantity: 95,
        unit: "Capsules",
        unitPrice: 14.00,
        expiryDate: "2027-09-18",
        supplier: "Global Care Labs",
        minStockThreshold: 25
      },
      {
        id: 8,
        code: "MED-008",
        name: "Sumatriptan 50mg",
        genericName: "Sumatriptan Succinate",
        category: "Neurology",
        stockQuantity: 32,
        unit: "Tablets",
        unitPrice: 35.00,
        expiryDate: "2027-06-25",
        supplier: "NeuroCore Sciences",
        minStockThreshold: 15
      }
    ],

    billings: [
      {
        id: 1,
        invoiceCode: "INV-7801",
        patientId: 1,
        patientName: "Jonathan Miller",
        doctorId: 1,
        doctorName: "Dr. Alexander Hayes",
        invoiceDate: "2026-10-31",
        dueDate: "2026-11-15",
        items: [
          { desc: "Cardiology Specialist Consultation", qty: 1, unitPrice: 180, total: 180 },
          { desc: "12-Lead Electrocardiogram (ECG)", qty: 1, unitPrice: 120, total: 120 },
          { desc: "Inpatient Room Charge (3 Nights)", qty: 3, unitPrice: 250, total: 750 },
          { desc: "Pharmacy: Lisinopril & Amlodipine", qty: 1, unitPrice: 38, total: 38 }
        ],
        subtotal: 1088,
        taxAmount: 54.40,
        discountAmount: 50,
        totalAmount: 1092.40,
        paymentStatus: "Paid",
        paymentMethod: "Insurance (BlueCross)",
        notes: "Claim #BC-99214 accepted."
      },
      {
        id: 2,
        invoiceCode: "INV-7802",
        patientId: 2,
        patientName: "Clara Oswald",
        doctorId: 2,
        doctorName: "Dr. Sarah Chen",
        invoiceDate: "2026-11-01",
        dueDate: "2026-11-15",
        items: [
          { desc: "Neurology Consultation", qty: 1, unitPrice: 200, total: 200 },
          { desc: "Prescription: Sumatriptan", qty: 1, unitPrice: 35, total: 35 }
        ],
        subtotal: 235,
        taxAmount: 11.75,
        discountAmount: 0,
        totalAmount: 246.75,
        paymentStatus: "Pending",
        paymentMethod: "Credit Card",
        notes: "Awaiting patient online payment."
      },
      {
        id: 3,
        invoiceCode: "INV-7803",
        patientId: 3,
        patientName: "Robert Langdon",
        doctorId: 3,
        doctorName: "Dr. Marcus Vance",
        invoiceDate: "2026-10-30",
        dueDate: "2026-11-10",
        items: [
          { desc: "Orthopedic Initial Assessment", qty: 1, unitPrice: 160, total: 160 },
          { desc: "High-Res Knee MRI Scan", qty: 1, unitPrice: 650, total: 650 },
          { desc: "Immobilization Knee Brace", qty: 1, unitPrice: 120, total: 120 }
        ],
        subtotal: 930,
        taxAmount: 46.50,
        discountAmount: 0,
        totalAmount: 976.50,
        paymentStatus: "Partially Paid",
        paymentMethod: "Cash / Co-pay",
        notes: "Deposit of $500 paid. Balance $476.50 pending."
      }
    ],

    beds: [
      { id: 1, ward: "General Ward A", bedNumber: "GW-101", type: "Standard", status: "Occupied", patientName: "Jonathan Miller" },
      { id: 2, ward: "General Ward A", bedNumber: "GW-102", type: "Standard", status: "Available", patientName: null },
      { id: 3, ward: "General Ward A", bedNumber: "GW-103", type: "Standard", status: "Available", patientName: null },
      { id: 4, ward: "General Ward B", bedNumber: "GW-201", type: "Standard", status: "Occupied", patientName: "Arthur Pendelton" },
      { id: 5, ward: "General Ward B", bedNumber: "GW-202", type: "Standard", status: "Maintenance", patientName: null },
      { id: 6, ward: "Intensive Care Unit (ICU)", bedNumber: "ICU-01", type: "ICU Critical", status: "Occupied", patientName: "Robert Langdon" },
      { id: 7, ward: "Intensive Care Unit (ICU)", bedNumber: "ICU-02", type: "ICU Critical", status: "Available", patientName: null },
      { id: 8, ward: "Pediatric Care", bedNumber: "PED-01", type: "Pediatric Crib", status: "Occupied", patientName: "Maya Lin" },
      { id: 9, ward: "Pediatric Care", bedNumber: "PED-02", type: "Pediatric Crib", status: "Available", patientName: null },
      { id: 10, ward: "Emergency Ward", bedNumber: "ER-01", type: "Trauma Bed", status: "Available", patientName: null },
      { id: 11, ward: "Emergency Ward", bedNumber: "ER-02", type: "Trauma Bed", status: "Available", patientName: null },
      { id: 12, ward: "Maternity Care", bedNumber: "MAT-01", type: "Labor Bed", status: "Available", patientName: null }
    ],

    activities: [
      { id: 1, type: "admission", text: "Patient Jonathan Miller admitted to Room 302", user: "Nurse Sarah", time: "10 mins ago" },
      { id: 2, type: "billing", text: "Invoice INV-7801 paid via Insurance ($1,092.40)", user: "Admin Desk", time: "35 mins ago" },
      { id: 3, type: "prescription", text: "Prescription issued for Clara Oswald by Dr. Sarah Chen", user: "Dr. Sarah Chen", time: "1 hour ago" },
      { id: 4, type: "appointment", text: "New appointment booked for Maya Lin (Pediatrics)", user: "Reception Desk", time: "2 hours ago" },
      { id: 5, type: "pharmacy", text: "Low stock alert triggered for Metformin 850mg (18 left)", user: "System Monitor", time: "4 hours ago" }
    ]
  };

  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        // Ensure all collections exist
        if (parsed.patients && parsed.doctors && parsed.appointments) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage, falling back to fresh seed:", e);
    }
    saveData(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  // Current session management
  var defaultUser = {
    name: "Dr. Alexander Hayes",
    email: "alexander.hayes@meditrack.org",
    role: "Chief Medical Officer",
    avatar: "AH"
  };

  function getCurrentUser() {
    try {
      var raw = localStorage.getItem(AUTH_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return defaultUser;
  }

  function setCurrentUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }

  // Master Store API
  var store = {
    // Session
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    logout: function () {
      localStorage.removeItem(AUTH_KEY);
      window.location.href = 'login.html';
    },

    // Reset to demo defaults
    resetToDefaults: function () {
      saveData(initialData);
      return initialData;
    },

    // Export raw JSON
    exportDataJSON: function () {
      return JSON.stringify(loadData(), null, 2);
    },

    // Import raw JSON
    importDataJSON: function (jsonStr) {
      try {
        var data = JSON.parse(jsonStr);
        saveData(data);
        return true;
      } catch (e) {
        return false;
      }
    },

    // Activity logging
    logActivity: function (type, text, user) {
      var data = loadData();
      var currentUser = user || getCurrentUser().name;
      var newAct = {
        id: Date.now(),
        type: type || 'general',
        text: text,
        user: currentUser,
        time: 'Just now'
      };
      data.activities.unshift(newAct);
      if (data.activities.length > 25) data.activities.pop();
      saveData(data);
    },
    getActivities: function () {
      return loadData().activities || [];
    },

    // PATIENTS
    getPatients: function () {
      return loadData().patients || [];
    },
    getPatientById: function (id) {
      var patients = loadData().patients || [];
      return patients.find(function (p) { return p.id === Number(id); });
    },
    addPatient: function (patient) {
      var data = loadData();
      var newId = (data.patients.length ? Math.max.apply(null, data.patients.map(function(p){ return p.id; })) : 0) + 1;
      patient.id = newId;
      if (!patient.patientCode) {
        patient.patientCode = 'PT-' + (1000 + newId);
      }
      if (!patient.vitals) {
        patient.vitals = { bp: "120/80", pulse: 72, temp: "98.6 °F", spo2: "99%" };
      }
      data.patients.unshift(patient);
      saveData(data);
      this.logActivity('patient', 'New patient ' + patient.name + ' registered (' + patient.patientCode + ')');
      return patient;
    },
    updatePatient: function (id, updatedFields) {
      var data = loadData();
      var index = data.patients.findIndex(function (p) { return p.id === Number(id); });
      if (index !== -1) {
        data.patients[index] = Object.assign({}, data.patients[index], updatedFields);
        saveData(data);
        this.logActivity('patient', 'Patient ' + data.patients[index].name + ' details updated');
        return data.patients[index];
      }
      return null;
    },
    deletePatient: function (id) {
      var data = loadData();
      var target = data.patients.find(function (p) { return p.id === Number(id); });
      var name = target ? target.name : 'ID ' + id;
      data.patients = data.patients.filter(function (p) { return p.id !== Number(id); });
      saveData(data);
      this.logActivity('patient', 'Patient record ' + name + ' removed from directory');
      return true;
    },

    // DOCTORS
    getDoctors: function () {
      return loadData().doctors || [];
    },
    getDoctorById: function (id) {
      var docs = loadData().doctors || [];
      return docs.find(function (d) { return d.id === Number(id); });
    },
    addDoctor: function (doc) {
      var data = loadData();
      var newId = (data.doctors.length ? Math.max.apply(null, data.doctors.map(function(d){ return d.id; })) : 0) + 1;
      doc.id = newId;
      var initials = doc.name.split(' ').map(function(n){ return n[0]; }).join('').slice(-2).toUpperCase();
      doc.avatar = initials || 'DR';
      data.doctors.push(doc);
      saveData(data);
      this.logActivity('doctor', 'New specialist ' + doc.name + ' (' + doc.specialization + ') added');
      return doc;
    },
    updateDoctor: function (id, fields) {
      var data = loadData();
      var idx = data.doctors.findIndex(function (d) { return d.id === Number(id); });
      if (idx !== -1) {
        data.doctors[idx] = Object.assign({}, data.doctors[idx], fields);
        saveData(data);
        return data.doctors[idx];
      }
      return null;
    },
    deleteDoctor: function (id) {
      var data = loadData();
      data.doctors = data.doctors.filter(function (d) { return d.id !== Number(id); });
      saveData(data);
      return true;
    },

    // APPOINTMENTS
    getAppointments: function () {
      return loadData().appointments || [];
    },
    bookAppointment: function (apt) {
      var data = loadData();
      var newId = (data.appointments.length ? Math.max.apply(null, data.appointments.map(function(a){ return a.id; })) : 0) + 1;
      apt.id = newId;
      apt.appointmentCode = 'APT-' + (200 + newId);
      apt.status = apt.status || 'Upcoming';
      data.appointments.unshift(apt);
      saveData(data);
      this.logActivity('appointment', 'Appointment ' + apt.appointmentCode + ' booked for ' + apt.patientName);
      return apt;
    },
    updateAppointmentStatus: function (id, status) {
      var data = loadData();
      var apt = data.appointments.find(function (a) { return a.id === Number(id); });
      if (apt) {
        apt.status = status;
        saveData(data);
        this.logActivity('appointment', 'Appointment ' + apt.appointmentCode + ' marked as ' + status);
        return apt;
      }
      return null;
    },
    rescheduleAppointment: function (id, newDate, newTime) {
      var data = loadData();
      var apt = data.appointments.find(function (a) { return a.id === Number(id); });
      if (apt) {
        apt.date = newDate;
        apt.time = newTime;
        apt.status = 'Rescheduled';
        saveData(data);
        this.logActivity('appointment', 'Appointment ' + apt.appointmentCode + ' rescheduled to ' + newDate + ' ' + newTime);
        return apt;
      }
      return null;
    },
    cancelAppointment: function (id) {
      return this.updateAppointmentStatus(id, 'Cancelled');
    },

    // MEDICAL RECORDS
    getMedicalRecords: function () {
      return loadData().medicalRecords || [];
    },
    addMedicalRecord: function (rec) {
      var data = loadData();
      var newId = (data.medicalRecords.length ? Math.max.apply(null, data.medicalRecords.map(function(r){ return r.id; })) : 0) + 1;
      rec.id = newId;
      rec.recordCode = 'REC-' + (500 + newId);
      data.medicalRecords.unshift(rec);
      saveData(data);
      this.logActivity('medical-record', 'Clinical record ' + rec.recordCode + ' filed for ' + rec.patientName);
      return rec;
    },
    deleteMedicalRecord: function (id) {
      var data = loadData();
      data.medicalRecords = data.medicalRecords.filter(function (r) { return r.id !== Number(id); });
      saveData(data);
      return true;
    },

    // MEDICINES / PHARMACY
    getMedicines: function () {
      return loadData().medicines || [];
    },
    addMedicine: function (med) {
      var data = loadData();
      var newId = (data.medicines.length ? Math.max.apply(null, data.medicines.map(function(m){ return m.id; })) : 0) + 1;
      med.id = newId;
      med.code = 'MED-' + (newId < 10 ? '00' : '0') + newId;
      data.medicines.unshift(med);
      saveData(data);
      this.logActivity('pharmacy', 'New medicine batch ' + med.name + ' stocked (' + med.stockQuantity + ' units)');
      return med;
    },
    updateMedicine: function (id, fields) {
      var data = loadData();
      var idx = data.medicines.findIndex(function (m) { return m.id === Number(id); });
      if (idx !== -1) {
        data.medicines[idx] = Object.assign({}, data.medicines[idx], fields);
        saveData(data);
        return data.medicines[idx];
      }
      return null;
    },
    adjustStock: function (id, delta) {
      var data = loadData();
      var med = data.medicines.find(function (m) { return m.id === Number(id); });
      if (med) {
        med.stockQuantity = Math.max(0, Number(med.stockQuantity) + Number(delta));
        saveData(data);
        this.logActivity('pharmacy', 'Inventory adjustment on ' + med.name + ': now ' + med.stockQuantity + ' ' + med.unit);
        return med;
      }
      return null;
    },
    deleteMedicine: function (id) {
      var data = loadData();
      data.medicines = data.medicines.filter(function (m) { return m.id !== Number(id); });
      saveData(data);
      return true;
    },

    // BILLING & INVOICING
    getBillings: function () {
      return loadData().billings || [];
    },
    addBilling: function (inv) {
      var data = loadData();
      var newId = (data.billings.length ? Math.max.apply(null, data.billings.map(function(b){ return b.id; })) : 0) + 1;
      inv.id = newId;
      inv.invoiceCode = 'INV-' + (7800 + newId);
      data.billings.unshift(inv);
      saveData(data);
      this.logActivity('billing', 'Invoice ' + inv.invoiceCode + ' created for ' + inv.patientName + ' ($' + Number(inv.totalAmount).toFixed(2) + ')');
      return inv;
    },
    updateBillingStatus: function (id, status, method) {
      var data = loadData();
      var inv = data.billings.find(function (b) { return b.id === Number(id); });
      if (inv) {
        inv.paymentStatus = status;
        if (method) inv.paymentMethod = method;
        saveData(data);
        this.logActivity('billing', 'Invoice ' + inv.invoiceCode + ' payment marked as ' + status);
        return inv;
      }
      return null;
    },

    // BEDS
    getBeds: function () {
      return loadData().beds || [];
    },
    updateBedStatus: function (bedNumber, status, patientName) {
      var data = loadData();
      var bed = data.beds.find(function (b) { return b.bedNumber === bedNumber; });
      if (bed) {
        bed.status = status;
        bed.patientName = status === 'Occupied' ? patientName : null;
        saveData(data);
        return bed;
      }
      return null;
    },

    // DASHBOARD COMPUTED METRICS
    getDashboardStats: function () {
      var data = loadData();
      var patients = data.patients || [];
      var doctors = data.doctors || [];
      var appointments = data.appointments || [];
      var beds = data.beds || [];
      var billings = data.billings || [];

      var todayStr = new Date().toISOString().slice(0, 10);
      var todayApts = appointments.filter(function (a) { return a.date === todayStr; });
      var availableBeds = beds.filter(function (b) { return b.status === 'Available'; });
      var totalRevenue = billings
        .filter(function (b) { return b.paymentStatus === 'Paid'; })
        .reduce(function (sum, b) { return sum + Number(b.totalAmount || 0); }, 0);
      var pendingRevenue = billings
        .filter(function (b) { return b.paymentStatus === 'Pending' || b.paymentStatus === 'Partially Paid'; })
        .reduce(function (sum, b) { return sum + Number(b.totalAmount || 0); }, 0);

      var lowStockMeds = (data.medicines || []).filter(function (m) {
        return m.stockQuantity <= (m.minStockThreshold || 25);
      });

      return {
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        availableDoctors: doctors.filter(function (d) { return d.availabilityStatus === 'Available'; }).length,
        todayAppointments: todayApts.length || appointments.slice(0, 4).length,
        upcomingAppointments: appointments.filter(function (a) { return a.status === 'Upcoming'; }).length,
        totalBeds: beds.length,
        availableBeds: availableBeds.length,
        occupiedBeds: beds.filter(function (b) { return b.status === 'Occupied'; }).length,
        totalRevenue: totalRevenue,
        pendingRevenue: pendingRevenue,
        lowStockMedicinesCount: lowStockMeds.length
      };
    }
  };

  // Self initialize on load
  loadData();

  window.MediStore = store;
})(window);
