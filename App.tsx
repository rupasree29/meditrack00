import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  UserPlus,
  Calendar,
  Clock,
  FileText,
  Pill,
  CreditCard,
  Building2,
  Stethoscope,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Download,
  LogOut,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  HeartPulse,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  CalendarDays
} from 'lucide-react';

// --- Types ---
interface Patient {
  id: number;
  patientCode: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  medicalCondition: string;
  bedRoom: string;
  status: 'Inpatient' | 'Outpatient' | 'Discharged';
  admissionDate: string;
  vitals: {
    bp: string;
    pulse: number;
    temp: string;
    spo2: string;
  };
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  email: string;
  phone: string;
  roomNumber: string;
  consultationFee: number;
  availabilityStatus: 'Available' | 'In Surgery' | 'Busy' | 'On Leave';
  scheduleHours: string;
  avatar: string;
}

interface Appointment {
  id: number;
  appointmentCode: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  notes: string;
  status: 'Upcoming' | 'Completed' | 'Rescheduled' | 'Cancelled';
}

interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface MedicalRecord {
  id: number;
  recordCode: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  labTests: string;
  followUpDate: string;
  prescriptions: PrescriptionItem[];
}

interface Medicine {
  id: number;
  code: string;
  name: string;
  genericName: string;
  category: string;
  stockQuantity: number;
  unit: string;
  unitPrice: number;
  expiryDate: string;
  supplier: string;
  minStockThreshold: number;
}

interface BillItem {
  desc: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface Billing {
  id: number;
  invoiceCode: string;
  patientId: number;
  patientName: string;
  doctorId?: number;
  doctorName?: string;
  invoiceDate: string;
  dueDate: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partially Paid';
  paymentMethod: string;
  notes: string;
}

interface Bed {
  id: number;
  ward: string;
  bedNumber: string;
  type: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  patientName: string | null;
}

interface ClinicalActivity {
  id: number;
  type: 'admission' | 'billing' | 'prescription' | 'appointment' | 'pharmacy';
  text: string;
  user: string;
  time: string;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface HospitalData {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  medicines: Medicine[];
  billings: Billing[];
  beds: Bed[];
  activities: ClinicalActivity[];
}

// --- Initial Seed Data ---
const initialSeed: HospitalData = {
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
  ] as Doctor[],

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
      emergencyContact: "Mary Miller (Spouse) +1 555-389-1022",
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
      emergencyContact: "Danny Pink (Partner) +1 555-492-3849",
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
      emergencyContact: "Sophie Neveu +1 555-723-9082",
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
      emergencyContact: "Rory Williams (Spouse) +1 555-601-8393",
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
      emergencyContact: "Gwen Pendelton +1 555-819-2042",
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
      emergencyContact: "Wei Lin (Father) +1 555-902-1145",
      medicalCondition: "Viral Gastroenteritis",
      bedRoom: "Pediatrics Bed 4",
      status: "Inpatient",
      admissionDate: "2026-11-01",
      vitals: { bp: "100/65", pulse: 96, temp: "101.1 °F", spo2: "99%" }
    }
  ] as Patient[],

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
      type: "Routine",
      reason: "Persistent productive cough, fever 3 days",
      status: "Upcoming",
      notes: "Auscultation of chest required."
    }
  ] as Appointment[],

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
    }
  ] as MedicalRecord[],

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
      stockQuantity: 18, // LOW STOCK
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
      stockQuantity: 12, // LOW STOCK
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
    }
  ] as Medicine[],

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
        { desc: "Inpatient Room Charge (3 Nights)", qty: 3, unitPrice: 250, total: 750 }
      ],
      subtotal: 1050,
      taxAmount: 52.50,
      discountAmount: 50,
      totalAmount: 1052.50,
      paymentStatus: "Paid",
      paymentMethod: "Insurance (BlueCross)",
      notes: "Claim #BC-99214 approved."
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
        { desc: "Neurology Specialist Assessment", qty: 1, unitPrice: 200, total: 200 },
        { desc: "Prescription: Sumatriptan", qty: 1, unitPrice: 35, total: 35 }
      ],
      subtotal: 235,
      taxAmount: 11.75,
      discountAmount: 0,
      totalAmount: 246.75,
      paymentStatus: "Pending",
      paymentMethod: "Credit Card",
      notes: "Patient payment pending online portal settlement."
    }
  ] as Billing[],

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
    { id: 10, ward: "Emergency Ward", bedNumber: "ER-01", type: "Trauma Bed", status: "Available", patientName: null }
  ] as Bed[],

  activities: [
    { id: 1, type: "admission", text: "Patient Jonathan Miller admitted to Room 302", user: "Nurse Sarah", time: "10 mins ago" },
    { id: 2, type: "billing", text: "Invoice INV-7801 paid via Insurance ($1,052.50)", user: "Admin Desk", time: "35 mins ago" },
    { id: 3, type: "prescription", text: "Prescription issued for Clara Oswald by Dr. Sarah Chen", user: "Dr. Sarah Chen", time: "1 hour ago" },
    { id: 4, type: "appointment", text: "Appointment booked for Maya Lin (Pediatrics)", user: "Reception Desk", time: "2 hours ago" },
    { id: 5, type: "pharmacy", text: "Low stock alert for Metformin 850mg (18 left)", user: "Pharmacy Bot", time: "4 hours ago" }
  ] as ClinicalActivity[]
};

export default function App() {
  // --- Persistent Storage State ---
  const [data, setData] = useState<HospitalData>(() => {
    try {
      const saved = localStorage.getItem('meditrack_react_data_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
    return initialSeed;
  });

  useEffect(() => {
    try {
      localStorage.setItem('meditrack_react_data_v1', JSON.stringify(data));
    } catch (e) {
      console.error("Storage save error:", e);
    }
  }, [data]);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'doctors' | 'appointments' | 'records' | 'medicines' | 'billing' | 'login'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Current Staff User
  const [currentUser, setCurrentUser] = useState({
    name: "Dr. Alexander Hayes",
    email: "doctor@meditrack.org",
    role: "Chief Medical Officer",
    avatar: "AH"
  });

  // Toast Notification System
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Activity logger
  const logActivity = (type: ClinicalActivity['type'], text: string) => {
    const act: ClinicalActivity = {
      id: Date.now(),
      type,
      text,
      user: currentUser.name,
      time: "Just now"
    };
    setData((prev: typeof initialSeed) => ({
      ...prev,
      activities: [act, ...prev.activities.slice(0, 19)]
    }));
  };

  // --- Modals State ---
  const [modalPatient, setModalPatient] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Patient }>({ open: false, mode: 'add' });
  const [viewPatientChart, setViewPatientChart] = useState<Patient | null>(null);
  
  const [modalDoctor, setModalDoctor] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Doctor }>({ open: false, mode: 'add' });
  
  const [modalAppointment, setModalAppointment] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [viewPassApt, setViewPassApt] = useState<Appointment | null>(null);

  const [modalRecord, setModalRecord] = useState(false);
  const [viewRecordReport, setViewRecordReport] = useState<MedicalRecord | null>(null);

  const [modalMedicine, setModalMedicine] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Medicine }>({ open: false, mode: 'add' });
  const [restockMedicine, setRestockMedicine] = useState<Medicine | null>(null);

  const [modalBill, setModalBill] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Billing | null>(null);

  // Search and Filter States
  const [globalSearch, setGlobalSearch] = useState('');
  const [patientFilterStatus, setPatientFilterStatus] = useState('All');
  const [patientFilterGender, setPatientFilterGender] = useState('All');

  const [doctorFilterSpec, setDoctorFilterSpec] = useState('All');
  const [doctorFilterAvail, setDoctorFilterAvail] = useState('All');

  const [aptFilterStatus, setAptFilterStatus] = useState('All');
  const [aptFilterDate, setAptFilterDate] = useState('All');

  const [medFilterCat, setMedFilterCat] = useState('All');
  const [medFilterStock, setMedFilterStock] = useState('All');

  const [billFilterStatus, setBillFilterStatus] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');

  // Computed KPIs
  const kpis = useMemo(() => {
    const totalPatients = data.patients.length;
    const totalDoctors = data.doctors.length;
    const availableDoctors = data.doctors.filter((d: Doctor) => d.availabilityStatus === 'Available').length;
    
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAppointments = data.appointments.filter((a: Appointment) => a.date === todayStr).length || data.appointments.slice(0, 3).length;
    
    const totalBeds = data.beds.length;
    const availableBeds = data.beds.filter((b: Bed) => b.status === 'Available').length;
    
    const totalRevenue = data.billings
      .filter((b: Billing) => b.paymentStatus === 'Paid')
      .reduce((acc: number, b: Billing) => acc + Number(b.totalAmount || 0), 0);
      
    const pendingRevenue = data.billings
      .filter((b: Billing) => b.paymentStatus !== 'Paid')
      .reduce((acc: number, b: Billing) => acc + Number(b.totalAmount || 0), 0);

    const lowStockMeds = data.medicines.filter((m: Medicine) => m.stockQuantity <= (m.minStockThreshold || 25)).length;

    return {
      totalPatients,
      totalDoctors,
      availableDoctors,
      todayAppointments,
      totalBeds,
      availableBeds,
      totalRevenue,
      pendingRevenue,
      lowStockMeds
    };
  }, [data]);

  // Download ZIP handler
  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/MediTrack.zip';
    link.download = 'MediTrack.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Download Started', 'MediTrack full project package is downloading.');
  };

  // Reset to default sample data
  const handleResetData = () => {
    if (confirm("Reset all hospital records to default clinical dataset?")) {
      setData(initialSeed);
      showToast('info', 'System Reset', 'All records restored to default demonstration state.');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      
      {/* Toast Alert Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg transition-all duration-200 min-w-[320px] max-w-md ${
              toast.type === 'success' ? 'border-emerald-500 border-l-4' :
              toast.type === 'error' ? 'border-rose-500 border-l-4' : 'border-sky-500 border-l-4'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Activity className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-sky-800 text-white shadow-md shadow-sky-500/20">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">MediTrack</h1>
              <span className="text-[10px] font-semibold tracking-wider text-sky-600 uppercase">Hospital System</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Clinical Operations
          </div>

          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className={`h-4 w-4 ${activeTab === 'dashboard' ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab('patients'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'patients' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`h-4 w-4 ${activeTab === 'patients' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Patients</span>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 tabular-nums">
              {data.patients.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('doctors'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'doctors' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Stethoscope className={`h-4 w-4 ${activeTab === 'doctors' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Doctors & Specialists</span>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 tabular-nums">
              {data.doctors.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('appointments'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'appointments' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className={`h-4 w-4 ${activeTab === 'appointments' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Appointments</span>
            </div>
            <span className="text-xs bg-sky-100 px-2 py-0.5 rounded-full text-sky-700 font-semibold tabular-nums">
              {kpis.todayAppointments} today
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('records'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'records' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className={`h-4 w-4 ${activeTab === 'records' ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>Medical Records (EHR)</span>
          </button>

          <div className="pt-4 px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Logistics & Finance
          </div>

          <button
            onClick={() => { setActiveTab('medicines'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'medicines' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Pill className={`h-4 w-4 ${activeTab === 'medicines' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Medicines & Pharmacy</span>
            </div>
            {kpis.lowStockMeds > 0 && (
              <span className="text-xs bg-rose-100 px-2 py-0.5 rounded-full text-rose-700 font-semibold">
                {kpis.lowStockMeds} low
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'billing' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className={`h-4 w-4 ${activeTab === 'billing' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Billing & Invoices</span>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 tabular-nums">
              {data.billings.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-4 ${
              activeTab === 'login' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${activeTab === 'login' ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>Staff Portal / Switch User</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Direct Frontend (Netlify / Vercel)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active React SPA with persistent LocalStorage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{currentUser.role}</p>
            </div>
            <button
              onClick={handleResetData}
              title="Reset Sample Data"
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">MediTrack</span>
              <span>/</span>
              <span className="capitalize text-slate-700 font-medium">
                {activeTab === 'records' ? 'Medical Records (EHR)' : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search across hospital..."
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 rounded-lg shadow-sm transition-all"
              title="Download Complete Project ZIP"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download ZIP</span>
            </button>

            {activeTab === 'patients' && (
              <button
                onClick={() => setModalPatient({ open: true, mode: 'add' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Patient</span>
              </button>
            )}

            {activeTab === 'appointments' && (
              <button
                onClick={() => setModalAppointment(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Book Appointment</span>
              </button>
            )}

            {activeTab === 'billing' && (
              <button
                onClick={() => setModalBill(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Generate Invoice</span>
              </button>
            )}

            {activeTab === 'records' && (
              <button
                onClick={() => setModalRecord(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Encounter</span>
              </button>
            )}

            {activeTab === 'medicines' && (
              <button
                onClick={() => setModalMedicine({ open: true, mode: 'add' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Medicine</span>
              </button>
            )}

            {activeTab === 'doctors' && (
              <button
                onClick={() => setModalDoctor({ open: true, mode: 'add' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Specialist</span>
              </button>
            )}
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* ======================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Hospital Operational Overview</h2>
                  <p className="text-xs text-slate-500 mt-1">Real-time clinical metrics, inpatient census, and departmental flow.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('patients')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
                  >
                    + Patient Admission
                  </button>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
                  >
                    Schedule Specialist
                  </button>
                </div>
              </div>

              {/* 5 KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{kpis.totalPatients}</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>+8.4% this month</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Doctors</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{kpis.availableDoctors} / {kpis.totalDoctors}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Active on duty</div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Visits</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{kpis.todayAppointments}</div>
                    <div className="text-[11px] text-sky-600 mt-1">Booked schedule</div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Beds</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{kpis.availableBeds} / {kpis.totalBeds}</div>
                    <div className="text-[11px] text-amber-600 mt-1">Ward & ICU ready</div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue Collected</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums font-mono">${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">Paid in full</div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Patient Admissions Chart & Specialty Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Area Chart */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Weekly Patient Inflow & Discharges</h3>
                      <p className="text-xs text-slate-500">Comparing admissions against hospital discharges</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-sky-500"></span>
                        <span className="text-slate-600">Admissions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-600">Discharges</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 h-60 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="admitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="40" y1="90" x2="580" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="40" y1="150" x2="580" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="40" y1="190" x2="580" y2="190" stroke="#e2e8f0" />

                      {/* Y-axis labels */}
                      <text x="30" y="34" fontSize="10" fill="#94a3b8" textAnchor="end">30</text>
                      <text x="30" y="94" fontSize="10" fill="#94a3b8" textAnchor="end">20</text>
                      <text x="30" y="154" fontSize="10" fill="#94a3b8" textAnchor="end">10</text>

                      {/* Area Fill */}
                      <path
                        d="M 60 110 L 140 85 L 220 100 L 300 45 L 380 65 L 460 95 L 540 70 L 540 190 L 60 190 Z"
                        fill="url(#admitGradient)"
                      />

                      {/* Line 1: Admissions */}
                      <path
                        d="M 60 110 L 140 85 L 220 100 L 300 45 L 380 65 L 460 95 L 540 70"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Line 2: Discharges */}
                      <path
                        d="M 60 135 L 140 105 L 220 120 L 300 80 L 380 75 L 460 110 L 540 100"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeDasharray="5 4"
                        strokeLinecap="round"
                      />

                      {/* Data Dots & X Labels */}
                      {[
                        { day: 'Mon', x: 60, y1: 110, y2: 135 },
                        { day: 'Tue', x: 140, y1: 85, y2: 105 },
                        { day: 'Wed', x: 220, y1: 100, y2: 120 },
                        { day: 'Thu', x: 300, y1: 45, y2: 80 },
                        { day: 'Fri', x: 380, y1: 65, y2: 75 },
                        { day: 'Sat', x: 460, y1: 95, y2: 110 },
                        { day: 'Sun', x: 540, y1: 70, y2: 100 }
                      ].map(pt => (
                        <g key={pt.day}>
                          <circle cx={pt.x} cy={pt.y1} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                          <circle cx={pt.x} cy={pt.y2} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                          <text x={pt.x} y="208" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500">
                            {pt.day}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Donut Chart: Specialty Distribution */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-900">Department Census</h3>
                    <p className="text-xs text-slate-500">Patient allocation by clinical specialty</p>
                  </div>

                  <div className="my-auto py-4 flex items-center justify-center gap-6">
                    <div className="relative w-36 h-36 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        {/* Circle circumference: 2 * pi * 45 = 282.74 */}
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#e2e8f0" strokeWidth="18" />
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#0284c7" strokeWidth="18" strokeDasharray="90 283" strokeDashoffset="0" />
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#0ea5e9" strokeWidth="18" strokeDasharray="68 283" strokeDashoffset="-90" />
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#10b981" strokeWidth="18" strokeDasharray="52 283" strokeDashoffset="-158" />
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray="42 283" strokeDashoffset="-210" />
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="30 283" strokeDashoffset="-252" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs text-slate-400 font-medium">Inpatients</span>
                        <span className="text-xl font-bold text-slate-900 tabular-nums">100%</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm bg-sky-600"></span>
                        <span className="text-slate-600">Cardiology</span>
                        <span className="font-semibold text-slate-900 ml-auto">32%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm bg-sky-400"></span>
                        <span className="text-slate-600">Orthopedics</span>
                        <span className="font-semibold text-slate-900 ml-auto">24%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
                        <span className="text-slate-600">Neurology</span>
                        <span className="font-semibold text-slate-900 ml-auto">18%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm bg-amber-500"></span>
                        <span className="text-slate-600">Pediatrics</span>
                        <span className="font-semibold text-slate-900 ml-auto">15%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm bg-purple-500"></span>
                        <span className="text-slate-600">General</span>
                        <span className="font-semibold text-slate-900 ml-auto">11%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Queue & Recent Activity Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Appointments Schedule Table */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Today's Appointment Queue</h3>
                      <p className="text-xs text-slate-500">Consultations, follow-ups, and procedures</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                        <tr>
                          <th className="py-3 px-4">Pass Code</th>
                          <th className="py-3 px-4">Patient</th>
                          <th className="py-3 px-4">Specialist</th>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.appointments.slice(0, 5).map(apt => (
                          <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-semibold text-sky-700">{apt.appointmentCode}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{apt.patientName}</div>
                              <div className="text-[11px] text-slate-500">{apt.type}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{apt.doctorName}</div>
                              <div className="text-[11px] text-slate-500">{apt.department}</div>
                            </td>
                            <td className="py-3 px-4 tabular-nums font-medium">{apt.time}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                                apt.status === 'Rescheduled' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              {apt.status !== 'Completed' && (
                                <button
                                  onClick={() => {
                                    setData(prev => ({
                                      ...prev,
                                      appointments: prev.appointments.map(a => a.id === apt.id ? { ...a, status: 'Completed' } : a)
                                    }));
                                    logActivity('appointment', `Appointment ${apt.appointmentCode} marked completed for ${apt.patientName}`);
                                    showToast('success', 'Completed', `Appointment ${apt.appointmentCode} completed.`);
                                  }}
                                  title="Mark Completed"
                                  className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setViewPassApt(apt)}
                                title="Print Slip"
                                className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-900">Recent Clinical Activity</h3>
                    <p className="text-xs text-slate-500">Live hospital event audit log</p>
                  </div>
                  <div className="divide-y divide-slate-100 mt-2">
                    {data.activities.slice(0, 5).map(act => (
                      <div key={act.id} className="py-2.5 flex items-start gap-3">
                        <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                          act.type === 'admission' ? 'bg-purple-500' :
                          act.type === 'billing' ? 'bg-emerald-500' :
                          act.type === 'pharmacy' ? 'bg-rose-500' : 'bg-sky-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 leading-snug">{act.text}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{act.time} · {act.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hospital Bed Matrix */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Hospital Ward & Bed Occupancy Matrix</h3>
                    <p className="text-xs text-slate-500">Real-time status of critical care, surgery, and general wards</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['All', 'General', 'ICU', 'Pediatric', 'Emergency'].map(w => (
                      <button
                        key={w}
                        onClick={() => setWardFilter(w)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                          wardFilter === w ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {data.beds
                    .filter(b => wardFilter === 'All' || b.ward.includes(wardFilter))
                    .map(bed => (
                      <div
                        key={bed.id}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          bed.status === 'Available' ? 'border-emerald-200 bg-emerald-50/50' :
                          bed.status === 'Occupied' ? 'border-rose-200 bg-rose-50/50' : 'border-amber-200 bg-amber-50/50'
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-900">{bed.bedNumber}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{bed.type}</div>
                        <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          bed.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                          bed.status === 'Occupied' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {bed.status}
                        </span>
                        <div className="text-[10px] text-slate-600 font-medium truncate mt-1">
                          {bed.patientName || bed.ward}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PATIENTS MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'patients' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Patient Directory</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage clinical charts, vital signs, emergency contacts, and admissions.</p>
                </div>
                <button
                  onClick={() => setModalPatient({ open: true, mode: 'add' })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register Patient</span>
                </button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 flex-wrap flex-1">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by name, ID, condition..."
                      value={globalSearch}
                      onChange={e => setGlobalSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                    />
                  </div>
                  <select
                    value={patientFilterStatus}
                    onChange={e => setPatientFilterStatus(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Admission Statuses</option>
                    <option value="Inpatient">Inpatient</option>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                  <select
                    value={patientFilterGender}
                    onChange={e => setPatientFilterGender(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <span className="text-xs text-slate-500">
                  Showing {data.patients.filter(p => 
                    (!globalSearch || p.name.toLowerCase().includes(globalSearch.toLowerCase()) || p.patientCode.toLowerCase().includes(globalSearch.toLowerCase())) &&
                    (patientFilterStatus === 'All' || p.status === patientFilterStatus) &&
                    (patientFilterGender === 'All' || p.gender === patientFilterGender)
                  ).length} patients
                </span>
              </div>

              {/* Patients Data Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Code</th>
                        <th className="py-3.5 px-4">Patient Profile</th>
                        <th className="py-3.5 px-4">Demographics</th>
                        <th className="py-3.5 px-4">Blood</th>
                        <th className="py-3.5 px-4">Contact / Ward</th>
                        <th className="py-3.5 px-4">Medical Condition</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.patients
                        .filter(p => 
                          (!globalSearch || p.name.toLowerCase().includes(globalSearch.toLowerCase()) || p.patientCode.toLowerCase().includes(globalSearch.toLowerCase())) &&
                          (patientFilterStatus === 'All' || p.status === patientFilterStatus) &&
                          (patientFilterGender === 'All' || p.gender === patientFilterGender)
                        )
                        .map(patient => (
                          <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-sky-700">{patient.patientCode}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                                  {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{patient.name}</div>
                                  <div className="text-[11px] text-slate-500">{patient.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 tabular-nums text-slate-700 font-medium">
                              {patient.age} yrs · {patient.gender}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{patient.bloodGroup}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-900 font-medium">{patient.phone}</div>
                              <div className="text-[11px] text-slate-500">{patient.bedRoom}</div>
                            </td>
                            <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-700">
                              {patient.medicalCondition}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                patient.status === 'Inpatient' ? 'bg-purple-100 text-purple-800' :
                                patient.status === 'Discharged' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {patient.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => setViewPatientChart(patient)}
                                title="View Vitals & Chart"
                                className="p-1.5 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setModalPatient({ open: true, mode: 'edit', data: patient })}
                                title="Edit Patient"
                                className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete patient "${patient.name}" (${patient.patientCode})?`)) {
                                    setData(prev => ({
                                      ...prev,
                                      patients: prev.patients.filter(p => p.id !== patient.id)
                                    }));
                                    logActivity('admission', `Patient ${patient.name} record deleted`);
                                    showToast('success', 'Patient Removed', `${patient.name} record was removed.`);
                                  }
                                }}
                                title="Delete Record"
                                className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DOCTORS & SPECIALISTS */}
          {/* ======================================================== */}
          {activeTab === 'doctors' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Medical Specialists Roster</h2>
                  <p className="text-xs text-slate-500 mt-1">Consulting physicians, surgeons, duty schedules, and live availability.</p>
                </div>
                <button
                  onClick={() => setModalDoctor({ open: true, mode: 'add' })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Specialist</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={doctorFilterSpec}
                    onChange={e => setDoctorFilterSpec(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Departments</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Oncology">Oncology</option>
                  </select>

                  <select
                    value={doctorFilterAvail}
                    onChange={e => setDoctorFilterAvail(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="In Surgery">In Surgery</option>
                    <option value="Busy">Busy</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <span className="text-xs text-slate-500">
                  {kpis.availableDoctors} on active duty now
                </span>
              </div>

              {/* Doctor Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.doctors
                  .filter(d => 
                    (doctorFilterSpec === 'All' || d.specialization === doctorFilterSpec) &&
                    (doctorFilterAvail === 'All' || d.availabilityStatus === doctorFilterAvail)
                  )
                  .map(doc => (
                    <div key={doc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-start gap-3.5 mb-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {doc.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h3>
                            <p className="text-xs font-semibold text-sky-600">{doc.specialization}</p>
                            <p className="text-[11px] text-slate-500 truncate">{doc.qualification}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Experience:</span>
                            <span className="font-semibold text-slate-900">{doc.experienceYears} Years</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Consultation Fee:</span>
                            <span className="font-mono font-bold text-slate-900">${doc.consultationFee}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Duty Hours:</span>
                            <span className="text-slate-800 font-medium">{doc.scheduleHours}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Room / Cabin:</span>
                            <span className="text-slate-800">{doc.roomNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between gap-2 mt-2">
                        {/* Status dropdown */}
                        <select
                          value={doc.availabilityStatus}
                          onChange={e => {
                            const newStatus = e.target.value as Doctor['availabilityStatus'];
                            setData(prev => ({
                              ...prev,
                              doctors: prev.doctors.map(d => d.id === doc.id ? { ...d, availabilityStatus: newStatus } : d)
                            }));
                            showToast('success', 'Status Updated', `${doc.name} marked as ${newStatus}`);
                          }}
                          className={`text-[11px] font-semibold py-1 px-2 rounded-lg border focus:outline-none ${
                            doc.availabilityStatus === 'Available' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            doc.availabilityStatus === 'In Surgery' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            doc.availabilityStatus === 'Busy' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="In Surgery">In Surgery</option>
                          <option value="Busy">Busy</option>
                          <option value="On Leave">On Leave</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setModalDoctor({ open: true, mode: 'edit', data: doc })}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Edit Doctor"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${doc.name} from roster?`)) {
                                setData(prev => ({
                                  ...prev,
                                  doctors: prev.doctors.filter(d => d.id !== doc.id)
                                }));
                                showToast('info', 'Doctor Removed', `${doc.name} removed from roster.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete Doctor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: APPOINTMENTS */}
          {/* ======================================================== */}
          {activeTab === 'appointments' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Appointment Management</h2>
                  <p className="text-xs text-slate-500 mt-1">Book consultations, reschedule patient visits, and print clinic passes.</p>
                </div>
                <button
                  onClick={() => setModalAppointment(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Book Appointment</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={aptFilterStatus}
                    onChange={e => setAptFilterStatus(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    value={aptFilterDate}
                    onChange={e => setAptFilterDate(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Dates</option>
                    <option value="Today">Scheduled Today</option>
                  </select>
                </div>
                <span className="text-xs text-slate-500">
                  {data.appointments.length} Total Bookings
                </span>
              </div>

              {/* Appointments Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Pass ID</th>
                        <th className="py-3.5 px-4">Patient Name & Reason</th>
                        <th className="py-3.5 px-4">Specialist Doctor</th>
                        <th className="py-3.5 px-4">Date & Slot</th>
                        <th className="py-3.5 px-4">Type</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.appointments
                        .filter(a => {
                          const today = new Date().toISOString().slice(0, 10);
                          const matchesDate = aptFilterDate === 'All' || a.date === today;
                          const matchesStatus = aptFilterStatus === 'All' || a.status === aptFilterStatus;
                          return matchesDate && matchesStatus;
                        })
                        .map(apt => (
                          <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-sky-700">{apt.appointmentCode}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-900">{apt.patientName}</div>
                              <div className="text-[11px] text-slate-500">{apt.reason || 'Routine Evaluation'}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-900">{apt.doctorName}</div>
                              <div className="text-[11px] text-slate-500">{apt.department}</div>
                            </td>
                            <td className="py-3.5 px-4 tabular-nums">
                              <div className="font-medium text-slate-900">{apt.date}</div>
                              <div className="text-[11px] text-slate-500">{apt.time}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{apt.type}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                                apt.status === 'Rescheduled' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => setViewPassApt(apt)}
                                title="Print Outpatient Pass"
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              {apt.status !== 'Completed' && (
                                <button
                                  onClick={() => {
                                    setData(prev => ({
                                      ...prev,
                                      appointments: prev.appointments.map(a => a.id === apt.id ? { ...a, status: 'Completed' } : a)
                                    }));
                                    logActivity('appointment', `Appointment ${apt.appointmentCode} marked completed`);
                                    showToast('success', 'Status Updated', `Appointment ${apt.appointmentCode} marked Completed.`);
                                  }}
                                  title="Mark Completed"
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                              {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                                <>
                                  <button
                                    onClick={() => setRescheduleApt(apt)}
                                    title="Reschedule"
                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Cancel appointment ${apt.appointmentCode}?`)) {
                                        setData(prev => ({
                                          ...prev,
                                          appointments: prev.appointments.map(a => a.id === apt.id ? { ...a, status: 'Cancelled' } : a)
                                        }));
                                        showToast('info', 'Cancelled', `Appointment ${apt.appointmentCode} cancelled.`);
                                      }
                                    }}
                                    title="Cancel"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: MEDICAL RECORDS (EHR) */}
          {/* ======================================================== */}
          {activeTab === 'records' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Electronic Health Records (EHR)</h2>
                  <p className="text-xs text-slate-500 mt-1">Diagnoses, clinical encounters, lab tests, and multi-item prescriptions.</p>
                </div>
                <button
                  onClick={() => setModalRecord(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Clinical Encounter</span>
                </button>
              </div>

              {/* Records Timeline List */}
              <div className="space-y-4">
                {data.medicalRecords.map(rec => (
                  <div key={rec.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded">
                          {rec.recordCode}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{rec.diagnosis}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Visit Date: <strong>{rec.visitDate}</strong></span>
                        <button
                          onClick={() => setViewRecordReport(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-md"
                        >
                          <Printer className="h-3.5 w-3.5 text-slate-500" />
                          <span>Print Summary</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Patient & Doctor</span>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">{rec.patientName}</p>
                        <p className="text-slate-500">Attending: {rec.doctorName}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Symptoms & Chief Complaints</span>
                        <p className="text-slate-800 mt-0.5">{rec.symptoms}</p>
                      </div>

                      <div className="md:col-span-2">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Treatment Plan & Clinical Notes</span>
                        <p className="text-slate-800 mt-0.5">{rec.treatment}</p>
                      </div>
                    </div>

                    {/* Prescriptions Sub-table */}
                    {rec.prescriptions && rec.prescriptions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-lg">
                        <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1 mb-2">
                          <Pill className="h-3.5 w-3.5" />
                          Prescribed Medications (Rx)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {rec.prescriptions.map((rx, idx) => (
                            <div key={idx} className="bg-white p-2 rounded border border-slate-200 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-900">{rx.medicine}</span>
                                <span className="text-slate-500 ml-1.5">({rx.dosage})</span>
                              </div>
                              <span className="text-slate-600 font-medium">{rx.frequency} · {rx.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div>Lab Tests: <strong>{rec.labTests || 'Routine examination'}</strong></div>
                      <div>Follow-up: <strong className="text-sky-700">{rec.followUpDate || 'As needed'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: MEDICINES & PHARMACY */}
          {/* ======================================================== */}
          {activeTab === 'medicines' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pharmacy & Drug Inventory</h2>
                  <p className="text-xs text-slate-500 mt-1">Batch monitoring, low-stock notifications, expiration dates, and quick restock.</p>
                </div>
                <button
                  onClick={() => setModalMedicine({ open: true, mode: 'add' })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Pharmaceutical Item</span>
                </button>
              </div>

              {/* Low Stock Warning Banner */}
              {kpis.lowStockMeds > 0 && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Critical Inventory Alert</h4>
                      <p className="text-xs text-rose-800 mt-0.5">
                        {kpis.lowStockMeds} item(s) are at or below minimum threshold safety buffer.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMedFilterStock('Low')}
                    className="px-3 py-1 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-md shadow-sm"
                  >
                    Filter Low Stock
                  </button>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={medFilterCat}
                    onChange={e => setMedFilterCat(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Drug Categories</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Analgesics">Analgesics & Pain</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>

                  <select
                    value={medFilterStock}
                    onChange={e => setMedFilterStock(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="Low">Low Stock Alerts Only</option>
                    <option value="Adequate">Adequate Stock</option>
                  </select>
                </div>
                <span className="text-xs text-slate-500">
                  {data.medicines.reduce((a, m) => a + m.stockQuantity, 0)} Total Units in Dispensary
                </span>
              </div>

              {/* Medicines Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Code</th>
                        <th className="py-3.5 px-4">Brand & Generic Name</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Stock In Hand</th>
                        <th className="py-3.5 px-4">Unit Price</th>
                        <th className="py-3.5 px-4">Expiry Date</th>
                        <th className="py-3.5 px-4">Distributor</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.medicines
                        .filter(m => {
                          const matchesCat = medFilterCat === 'All' || m.category === medFilterCat;
                          const isLow = m.stockQuantity <= (m.minStockThreshold || 25);
                          const matchesStock = medFilterStock === 'All' || (medFilterStock === 'Low' ? isLow : !isLow);
                          return matchesCat && matchesStock;
                        })
                        .map(med => {
                          const isLow = med.stockQuantity <= (med.minStockThreshold || 25);
                          return (
                            <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-sky-700">{med.code}</td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900">{med.name}</div>
                                <div className="text-[11px] text-slate-500">{med.genericName}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{med.category}</span>
                              </td>
                              <td className="py-3.5 px-4 tabular-nums">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {med.stockQuantity}
                                  </span>
                                  <span className="text-slate-500">{med.unit}</span>
                                  {isLow && (
                                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                      Low
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                                ${med.unitPrice.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4 tabular-nums text-slate-700">
                                {med.expiryDate}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 max-w-[140px] truncate">
                                {med.supplier}
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                                <button
                                  onClick={() => setRestockMedicine(med)}
                                  className="px-2 py-1 text-[11px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded"
                                >
                                  + Restock
                                </button>
                                <button
                                  onClick={() => setModalMedicine({ open: true, mode: 'edit', data: med })}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                                  title="Edit Item"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete ${med.name} from pharmacy?`)) {
                                      setData(prev => ({
                                        ...prev,
                                        medicines: prev.medicines.filter(m => m.id !== med.id)
                                      }));
                                      showToast('info', 'Medicine Deleted', `${med.name} removed from inventory.`);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                  title="Delete Item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: BILLING & INVOICING */}
          {/* ======================================================== */}
          {activeTab === 'billing' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Patient Billing & Invoicing</h2>
                  <p className="text-xs text-slate-500 mt-1">Itemized service fees, insurance claims, tax receipts, and payment settlements.</p>
                </div>
                <button
                  onClick={() => setModalBill(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Generate Invoice</span>
                </button>
              </div>

              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Billed</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                    ${(kpis.totalRevenue + kpis.pendingRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{data.billings.length} total invoices</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected Revenue</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                    ${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">Settled payments</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Balance</span>
                  <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
                    ${kpis.pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-amber-700 mt-1">Awaiting insurance or patient</div>
                </div>
              </div>

              {/* Billing Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Invoice #</th>
                        <th className="py-3.5 px-4">Patient Name</th>
                        <th className="py-3.5 px-4">Attending Doctor</th>
                        <th className="py-3.5 px-4">Issued Date</th>
                        <th className="py-3.5 px-4">Grand Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Payment Channel</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.billings.map(bill => (
                        <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-sky-700">{bill.invoiceCode}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{bill.patientName}</td>
                          <td className="py-3.5 px-4 text-slate-700">{bill.doctorName || 'Hospital Care'}</td>
                          <td className="py-3.5 px-4 tabular-nums text-slate-600">{bill.invoiceDate}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            ${bill.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              bill.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              bill.paymentStatus === 'Partially Paid' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {bill.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{bill.paymentMethod}</td>
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => setViewInvoice(bill)}
                              title="Print Invoice"
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                            {bill.paymentStatus !== 'Paid' && (
                              <button
                                onClick={() => {
                                  setData(prev => ({
                                    ...prev,
                                    billings: prev.billings.map(b => b.id === bill.id ? { ...b, paymentStatus: 'Paid' } : b)
                                  }));
                                  logActivity('billing', `Invoice ${bill.invoiceCode} paid ($${bill.totalAmount.toFixed(2)})`);
                                  showToast('success', 'Payment Settled', `Invoice ${bill.invoiceCode} marked Paid.`);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: STAFF PORTAL & ROLE SWITCHING */}
          {/* ======================================================== */}
          {activeTab === 'login' && (
            <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Hospital Staff Portal</h2>
                <p className="text-xs text-slate-500">Fast 1-click credential switching for demonstration & auditing</p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Select User Session:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: "Dr. Alexander Hayes", role: "Chief Medical Officer", email: "doctor@meditrack.org", avatar: "AH" },
                    { name: "Sarah Jenkins", role: "Hospital Administrator", email: "admin@meditrack.org", avatar: "SJ" },
                    { name: "Emily Watson", role: "Front Desk Coordinator", email: "reception@meditrack.org", avatar: "EW" }
                  ].map(profile => (
                    <button
                      key={profile.email}
                      onClick={() => {
                        setCurrentUser(profile);
                        showToast('success', 'Session Switched', `Logged in as ${profile.name}`);
                        setActiveTab('dashboard');
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        currentUser.email === profile.email
                          ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                          {profile.avatar}
                        </div>
                        <span className="font-bold text-xs text-slate-900 truncate">{profile.name}</span>
                      </div>
                      <p className="text-[11px] text-sky-700 font-semibold">{profile.role}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{profile.email}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Current Terminal ID: <strong>TERM-04-NYC</strong></span>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="font-semibold text-sky-600 hover:text-sky-800"
                >
                  Return to Dashboard →
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT PATIENT */}
      {/* ======================================================== */}
      {modalPatient.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {modalPatient.mode === 'add' ? 'Register New Patient' : `Edit Patient – ${modalPatient.data?.name}`}
              </h3>
              <button
                onClick={() => setModalPatient({ open: false, mode: 'add' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);

                const newPatient: Patient = {
                  id: modalPatient.mode === 'edit' && modalPatient.data ? modalPatient.data.id : Date.now(),
                  patientCode: modalPatient.mode === 'edit' && modalPatient.data ? modalPatient.data.patientCode : `PT-${1000 + data.patients.length + 1}`,
                  name: formData.get('name') as string,
                  age: Number(formData.get('age')),
                  gender: formData.get('gender') as Patient['gender'],
                  bloodGroup: formData.get('bloodGroup') as string,
                  phone: formData.get('phone') as string,
                  email: (formData.get('email') as string) || 'patient@example.com',
                  address: (formData.get('address') as string) || 'Springfield, USA',
                  emergencyContact: (formData.get('emergencyContact') as string) || 'Family Member',
                  medicalCondition: (formData.get('medicalCondition') as string) || 'Clinical Assessment',
                  bedRoom: (formData.get('bedRoom') as string) || 'Outpatient',
                  status: (formData.get('status') as Patient['status']) || 'Inpatient',
                  admissionDate: new Date().toISOString().slice(0, 10),
                  vitals: modalPatient.data?.vitals || { bp: "120/80", pulse: 72, temp: "98.6 °F", spo2: "99%" }
                };

                if (modalPatient.mode === 'edit') {
                  setData(prev => ({
                    ...prev,
                    patients: prev.patients.map(p => p.id === newPatient.id ? newPatient : p)
                  }));
                  showToast('success', 'Patient Updated', `${newPatient.name} details saved.`);
                } else {
                  setData(prev => ({
                    ...prev,
                    patients: [newPatient, ...prev.patients]
                  }));
                  logActivity('admission', `New patient ${newPatient.name} registered (${newPatient.patientCode})`);
                  showToast('success', 'Patient Admitted', `${newPatient.name} admitted successfully.`);
                }

                setModalPatient({ open: false, mode: 'add' });
              }}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Full Patient Name *</label>
                  <input
                    name="name"
                    defaultValue={modalPatient.data?.name}
                    required
                    placeholder="e.g. Eleanor Vance"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age *</label>
                  <input
                    name="age"
                    type="number"
                    defaultValue={modalPatient.data?.age || 35}
                    required
                    min={0}
                    max={120}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    name="gender"
                    defaultValue={modalPatient.data?.gender || 'Female'}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Group *</label>
                  <select
                    name="bloodGroup"
                    defaultValue={modalPatient.data?.bloodGroup || 'O+'}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    name="phone"
                    defaultValue={modalPatient.data?.phone}
                    required
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={modalPatient.data?.email}
                    placeholder="patient@example.com"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Primary Clinical Diagnosis / Condition</label>
                  <input
                    name="medicalCondition"
                    defaultValue={modalPatient.data?.medicalCondition}
                    placeholder="e.g. Hypertensive Heart Disease, Fracture"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Room / Bed Assignment</label>
                  <input
                    name="bedRoom"
                    defaultValue={modalPatient.data?.bedRoom || 'Room 302 - Bed A'}
                    placeholder="e.g. Room 205 or Outpatient"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Admission Status</label>
                  <select
                    name="status"
                    defaultValue={modalPatient.data?.status || 'Inpatient'}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Inpatient">Inpatient</option>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalPatient({ open: false, mode: 'add' })}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PATIENT CLINICAL VITALS CHART */}
      {/* ======================================================== */}
      {viewPatientChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Patient Clinical Chart & Vitals</h3>
              <button onClick={() => setViewPatientChart(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="h-14 w-14 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {viewPatientChart.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{viewPatientChart.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-bold text-sky-700">{viewPatientChart.patientCode}</span>
                    <span>·</span>
                    <span>{viewPatientChart.age} yrs, {viewPatientChart.gender}</span>
                    <span>·</span>
                    <span className="font-bold text-slate-800">Blood {viewPatientChart.bloodGroup}</span>
                  </div>
                </div>
              </div>

              {/* 4 Vitals Badges */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Current Vital Signs
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block tabular-nums">
                      {viewPatientChart.vitals.bp}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Pulse Rate</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block tabular-nums">
                      {viewPatientChart.vitals.pulse} bpm
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Temperature</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block tabular-nums">
                      {viewPatientChart.vitals.temp}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Oxygen (SpO2)</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block tabular-nums">
                      {viewPatientChart.vitals.spo2}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Contacts & Hospital Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Contact Information</span>
                  <p className="text-slate-800">Phone: {viewPatientChart.phone}</p>
                  <p className="text-slate-800">Email: {viewPatientChart.email}</p>
                  <p className="text-slate-600">Address: {viewPatientChart.address}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Hospitalization</span>
                  <p className="text-slate-800">Ward/Room: <strong>{viewPatientChart.bedRoom}</strong></p>
                  <p className="text-slate-800">Condition: {viewPatientChart.medicalCondition}</p>
                  <p className="text-slate-600">Emergency: {viewPatientChart.emergencyContact}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setViewPatientChart(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Close Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: BOOK APPOINTMENT */}
      {/* ======================================================== */}
      {modalAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Book Patient Appointment</h3>
              <button onClick={() => setModalAppointment(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);

                const patientId = Number(formData.get('patientId'));
                const doctorId = Number(formData.get('doctorId'));

                const patient = data.patients.find(p => p.id === patientId);
                const doctor = data.doctors.find(d => d.id === doctorId);

                if (!patient || !doctor) return;

                const newApt: Appointment = {
                  id: Date.now(),
                  appointmentCode: `APT-${200 + data.appointments.length + 1}`,
                  patientId: patient.id,
                  patientName: patient.name,
                  doctorId: doctor.id,
                  doctorName: doctor.name,
                  department: doctor.specialization,
                  date: formData.get('date') as string,
                  time: formData.get('time') as string,
                  type: formData.get('type') as string,
                  reason: (formData.get('reason') as string) || 'Specialist Consultation',
                  notes: (formData.get('notes') as string) || '',
                  status: 'Upcoming'
                };

                setData(prev => ({
                  ...prev,
                  appointments: [newApt, ...prev.appointments]
                }));

                logActivity('appointment', `Appointment ${newApt.appointmentCode} booked for ${patient.name} with ${doctor.name}`);
                showToast('success', 'Appointment Booked', `Scheduled for ${newApt.date} at ${newApt.time}`);
                setModalAppointment(false);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Patient *</label>
                <select name="patientId" required className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                  {data.patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patientCode}) - {p.phone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Specialist Doctor *</label>
                <select name="doctorId" required className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                  {data.doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} – {d.specialization} (${d.consultationFee})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date *</label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Time Slot *</label>
                  <select name="time" required className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                    {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '02:00 PM', '03:15 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Appointment Type</label>
                <select name="type" className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                  <option value="Consultation">Specialist Consultation</option>
                  <option value="Follow-up">Clinical Follow-up</option>
                  <option value="Routine">Routine Checkup</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason / Symptoms</label>
                <input
                  name="reason"
                  placeholder="e.g. Chest tightness, headache"
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAppointment(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: PRINTABLE OUTPATIENT APPOINTMENT PASS */}
      {/* ======================================================== */}
      {viewPassApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden p-6 print-area">
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
              <h2 className="text-xl font-bold text-sky-700">MediTrack Health System</h2>
              <p className="text-xs text-slate-500">Outpatient Consultation Pass</p>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pass Code:</span>
                <span className="font-mono font-bold text-slate-900">{viewPassApt.appointmentCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{viewPassApt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Physician:</span>
                <span className="font-bold text-slate-900">{viewPassApt.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-900">{viewPassApt.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-bold text-sky-800">{viewPassApt.date} · {viewPassApt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="text-slate-900">{viewPassApt.type}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded text-[11px] text-slate-500 text-center">
              Please present this pass at the consultation wing 10 minutes before your slot.
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                onClick={() => setViewPassApt(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
              >
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: PRINTABLE OFFICIAL HOSPITAL INVOICE */}
      {/* ======================================================== */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-8 print-area my-8">
            <div className="flex justify-between items-start pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">MediTrack Medical Center</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  100 Innovation Parkway, Suite 500<br />Medical District, NY 10001<br />billing@meditrack.org
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-sky-700">INVOICE</div>
                <div className="font-mono text-sm font-bold text-slate-900 mt-1">{viewInvoice.invoiceCode}</div>
                <div className="text-xs text-slate-500 mt-1">Date: {viewInvoice.invoiceDate}</div>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  viewInvoice.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {viewInvoice.paymentStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Billed To:</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{viewInvoice.patientName}</p>
                <p className="text-slate-500 mt-0.5">Medical Patient</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Care Details:</span>
                <p className="text-slate-800 mt-1">Doctor: <strong>{viewInvoice.doctorName || 'Clinical Care'}</strong></p>
                <p className="text-slate-800">Channel: {viewInvoice.paymentMethod}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{it.desc}</td>
                      <td className="py-2.5 px-3 text-center tabular-nums">{it.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono">${it.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">${it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Math */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-56 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">${viewInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (5%):</span>
                  <span className="font-mono font-semibold">${viewInvoice.taxAmount.toFixed(2)}</span>
                </div>
                {viewInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount / Coverage:</span>
                    <span className="font-mono">-${viewInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono">${viewInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: GENERATE BILL */}
      {/* ======================================================== */}
      {modalBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Generate Patient Invoice</h3>
              <button onClick={() => setModalBill(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);

                const patientId = Number(formData.get('patientId'));
                const patient = data.patients.find(p => p.id === patientId);
                if (!patient) return;

                const desc = formData.get('itemDesc') as string;
                const price = Number(formData.get('itemPrice'));
                const qty = Number(formData.get('itemQty'));
                const subtotal = qty * price;
                const tax = subtotal * 0.05;
                const total = subtotal + tax;

                const newBill: Billing = {
                  id: Date.now(),
                  invoiceCode: `INV-${7800 + data.billings.length + 1}`,
                  patientId: patient.id,
                  patientName: patient.name,
                  doctorName: "Dr. Alexander Hayes",
                  invoiceDate: new Date().toISOString().slice(0, 10),
                  dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10),
                  items: [{ desc, qty, unitPrice: price, total: subtotal }],
                  subtotal,
                  taxAmount: tax,
                  discountAmount: 0,
                  totalAmount: total,
                  paymentStatus: formData.get('status') as Billing['paymentStatus'],
                  paymentMethod: formData.get('method') as string,
                  notes: "Hospital care settlement"
                };

                setData(prev => ({
                  ...prev,
                  billings: [newBill, ...prev.billings]
                }));

                logActivity('billing', `Invoice ${newBill.invoiceCode} generated for ${patient.name} ($${total.toFixed(2)})`);
                showToast('success', 'Invoice Created', `Invoice ${newBill.invoiceCode} generated.`);
                setModalBill(false);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Patient *</label>
                <select name="patientId" required className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                  {data.patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service / Procedure Description *</label>
                <input
                  name="itemDesc"
                  defaultValue="Specialist Clinical Consultation & Examination"
                  required
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity *</label>
                  <input
                    name="itemQty"
                    type="number"
                    defaultValue={1}
                    min={1}
                    required
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Price ($) *</label>
                  <input
                    name="itemPrice"
                    type="number"
                    defaultValue={180}
                    step="0.01"
                    min={1}
                    required
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Status</label>
                  <select name="status" className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Channel</label>
                  <select name="method" className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                    <option value="Insurance (Direct Claim)">Health Insurance</option>
                    <option value="Credit Card">Credit / Debit Card</option>
                    <option value="Cash Settlement">Cash</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalBill(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: QUICK RESTOCK MEDICINE */}
      {/* ======================================================== */}
      {restockMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Restock Drug Inventory</h3>
              <p className="text-slate-500 mt-0.5">{restockMedicine.name} ({restockMedicine.code})</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Current Stock:</span>
                <span className="font-bold text-slate-900">{restockMedicine.stockQuantity} {restockMedicine.unit}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Units to Add *</label>
              <input
                id="restockInput"
                type="number"
                defaultValue={50}
                min={1}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 font-bold text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setRestockMedicine(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('restockInput') as HTMLInputElement;
                  const delta = Number(input?.value) || 50;
                  setData(prev => ({
                    ...prev,
                    medicines: prev.medicines.map(m => m.id === restockMedicine.id ? { ...m, stockQuantity: m.stockQuantity + delta } : m)
                  }));
                  logActivity('pharmacy', `Restocked ${delta} units of ${restockMedicine.name}`);
                  showToast('success', 'Stock Replenished', `${delta} units added to ${restockMedicine.name}.`);
                  setRestockMedicine(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 8: NEW CLINICAL ENCOUNTER (EHR) */}
      {/* ======================================================== */}
      {modalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 text-xs space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Record Clinical Encounter & Diagnosis</h3>
              <button onClick={() => setModalRecord(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);

                const patientId = Number(formData.get('patientId'));
                const doctorId = Number(formData.get('doctorId'));

                const patient = data.patients.find(p => p.id === patientId);
                const doctor = data.doctors.find(d => d.id === doctorId);

                if (!patient || !doctor) return;

                const newRec: MedicalRecord = {
                  id: Date.now(),
                  recordCode: `REC-${500 + data.medicalRecords.length + 1}`,
                  patientId: patient.id,
                  patientName: patient.name,
                  doctorId: doctor.id,
                  doctorName: doctor.name,
                  visitDate: new Date().toISOString().slice(0, 10),
                  symptoms: formData.get('symptoms') as string,
                  diagnosis: formData.get('diagnosis') as string,
                  treatment: formData.get('treatment') as string,
                  labTests: formData.get('labTests') as string,
                  followUpDate: formData.get('followUpDate') as string,
                  prescriptions: [
                    {
                      medicine: (formData.get('rxMed') as string) || 'Amoxicillin',
                      dosage: (formData.get('rxDose') as string) || '500mg',
                      frequency: '1-0-1 (With meals)',
                      duration: '7 Days'
                    }
                  ]
                };

                setData(prev => ({
                  ...prev,
                  medicalRecords: [newRec, ...prev.medicalRecords]
                }));

                logActivity('prescription', `Clinical record ${newRec.recordCode} filed for ${patient.name}`);
                showToast('success', 'Record Filed', `Diagnosis recorded for ${patient.name}`);
                setModalRecord(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Patient *</label>
                  <select name="patientId" required className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                    {data.patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Attending Physician *</label>
                  <select name="doctorId" required className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900">
                    {data.doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Presenting Symptoms *</label>
                <textarea
                  name="symptoms"
                  required
                  rows={2}
                  placeholder="e.g. Sharp epigastric burning, nausea..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Diagnosis *</label>
                <input
                  name="diagnosis"
                  required
                  placeholder="e.g. Acute Gastritis, Stage 1 Hypertension"
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Treatment Plan & Observations</label>
                <textarea
                  name="treatment"
                  rows={2}
                  placeholder="Supportive hydration, dietary adjustment..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prescribed Drug (Rx)</label>
                  <input
                    name="rxMed"
                    defaultValue="Amoxicillin 500mg"
                    placeholder="Medicine name"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dosage</label>
                  <input
                    name="rxDose"
                    defaultValue="500mg Capsule"
                    placeholder="e.g. 10mg"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lab Investigations</label>
                  <input
                    name="labTests"
                    placeholder="CBC, Serum Electrolytes"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Follow-up Date</label>
                  <input
                    name="followUpDate"
                    type="date"
                    defaultValue={new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalRecord(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Save Encounter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 9: PRINT CLINICAL RECORD REPORT */}
      {/* ======================================================== */}
      {viewRecordReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 text-xs print-area space-y-4">
            <div className="text-center pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-sky-700">MediTrack Healthcare System</h2>
              <p className="text-slate-500">Electronic Health Record (EHR) Clinical Summary</p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Record ID:</span>
                <span className="font-mono font-bold text-slate-900">{viewRecordReport.recordCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{viewRecordReport.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attending Physician:</span>
                <span className="font-bold text-slate-900">{viewRecordReport.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visit Date:</span>
                <span>{viewRecordReport.visitDate}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block">Symptoms:</span>
                <p className="font-medium text-slate-800">{viewRecordReport.symptoms}</p>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Primary Diagnosis:</span>
                <p className="text-sm font-bold text-sky-700">{viewRecordReport.diagnosis}</p>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Treatment & Regimen:</span>
                <p className="font-medium text-slate-800">{viewRecordReport.treatment}</p>
              </div>
            </div>

            {viewRecordReport.prescriptions && viewRecordReport.prescriptions.length > 0 && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block mb-1">Medication Prescriptions (Rx)</span>
                {viewRecordReport.prescriptions.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="font-bold">{p.medicine} ({p.dosage})</span>
                    <span>{p.frequency} · {p.duration}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                onClick={() => setViewRecordReport(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
