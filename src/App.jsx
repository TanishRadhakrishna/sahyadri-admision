"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Bell, BookOpen, Bus, Check,
  CheckCircle2, ChevronDown, ClipboardCheck, Clock3, CreditCard,
  Download, FileCheck2, FileText, GraduationCap, LayoutDashboard,
  LogOut, Menu, Search, Settings, ShieldCheck, UploadCloud,
  User, Users, Wallet, X, Eye, Filter, Plus, CircleHelp,
  Home, Mail, Phone, RefreshCw, AlertCircle, Printer, Save
} from "lucide-react";

const STORE = "sahyadri-admission-demo-v1";
const routes = ["Management", "CET / KEA", "COMEDK"];
const courses = [
  "Computer Science & Engineering",
  "Computer Science & Engineering (AI & ML)",
  "Information Science & Engineering",
  "Electronics & Communication Engineering",
  "Electronics & Computer Engineering",
  "Mechanical Engineering",
  "Robotics & Automation Engineering"
];


const FIRST_ADMISSION_SERIAL = 768;

const COURSE_CODES = {
  "Computer Science & Engineering": "CS",
  "Computer Science & Engineering (AI & ML)": "AIML",
  "Information Science & Engineering": "IS",
  "Electronics & Communication Engineering": "EC",
  "Electronics & Computer Engineering": "ENC",
  "Mechanical Engineering": "ME",
  "Robotics & Automation Engineering": "RA",
};

function generateAdmissionNumber(students, student) {
  const startYear = Number(student.academicStartYear || 2026);
  const endYear = startYear + 4;

  const branchCode = COURSE_CODES[student.course] || "BE";
  const academicYear = `${startYear}-${String(endYear).slice(-2)}`;

  const existingSerials = students
    .filter((s) => s.admissionNumber)
    .map((s) => {
      const match = s.admissionNumber.match(
        /^(\d{4})\/[A-Z]+\/(\d{4})-(\d{2})$/
      );

      if (!match) return 0;

      const sameStartYear = Number(match[2]) === startYear;
      const sameEndYear = Number(match[3]) === endYear % 100;

      return sameStartYear && sameEndYear
        ? Number(match[1])
        : 0;
    });

  const nextSerial =
    Math.max(FIRST_ADMISSION_SERIAL - 1, ...existingSerials) + 1;

  return `${String(nextSerial).padStart(4, "0")}/${branchCode}/${academicYear}`;
}


const blankStudent = {
  id: "", name: "", phone: "", email: "", course: courses[0], programme: "B.E", academicStartYear: 2026,
  route: "", status: "Registered", progress: 0, currentStep: 0, createdAt: "",
  personal: {}, family: {}, address: {}, facilities: {}, academics: {},
  entrance: {}, documents: {}, declarations: {}, paymentMode: "", paymentStatus: "Not initiated",
  admissionNumber: "", submitted: false, officerNote: ""
};  


const seed = [
  {
    ...blankStudent, id: "SCEM-2026-001", name: "Aarav Shetty", phone: "9876543210",
    email: "aarav.shetty@example.com", course: "Information Science & Engineering",
    route: "CET / KEA", status: "Application in progress", progress: 60, currentStep: 6,
    createdAt: "22 Nov 2026", paymentStatus: "Not initiated"
  },
  {
    ...blankStudent, id: "SCEM-2026-002", name: "Diya Rao", phone: "9845012345",
    email: "diya.rao@example.com", course: "Computer Science & Engineering",
    route: "Management", status: "Submitted", progress: 100, currentStep: 10,
    createdAt: "21 Nov 2026", submitted: true, paymentStatus: "Pending"
  },
  {
    ...blankStudent, id: "SCEM-2026-003", name: "Rohan Kumar", phone: "9900123456",
    email: "rohan.kumar@example.com", course: "Electronics & Communication Engineering",
    route: "COMEDK", status: "Fee confirmed", progress: 100, currentStep: 10,
    createdAt: "20 Nov 2026", submitted: true, paymentMode: "Online",
    paymentStatus: "Confirmed", admissionNumber: "SCEM/BE/2026/0042"
  },
  {
    ...blankStudent, id: "SCEM-2026-004", name: "Ananya Pai", phone: "9880765432",
    email: "ananya.pai@example.com", course: "Robotics & Automation Engineering",
    route: "DCET", status: "Registered", progress: 0, currentStep: 0,
    createdAt: "22 Nov 2026"
  }
];

const steps = [
  "Admission details", "Personal information", "Parent & guardian",
  "Address details", "Facilities & activities", "Academic details",
  "Entrance examination", "Document uploads", "Declarations", "Review"
];

function readStore() {
  if (typeof window === "undefined") return { students: seed, currentId: null };
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORE));
    return saved?.students?.length ? saved : { students: seed, currentId: null };
  } catch { return { students: seed, currentId: null }; }
}
function saveStore(data) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORE, JSON.stringify(data));
}
function today() { return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function clsStatus(s) {
  if (/confirmed|admitted/i.test(s)) return "green";
  if (/reject|correction/i.test(s)) return "red";
  if (/submitted|review/i.test(s)) return "blue";
  return "amber";
}
function Field({ label, value, onChange, placeholder, type = "text", required = false, options, hint }) {
  return <label className="field">
    <span>{label}{required && <b className="required"> *</b>}</span>
    {options ? <select value={value || ""} onChange={e => onChange(e.target.value)}>
      <option value="">Select {label.toLowerCase()}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select> : <input type={type} value={value || ""} placeholder={placeholder || `Enter ${label.toLowerCase()}`} onChange={e => onChange(e.target.value)} />}
    {hint && <small>{hint}</small>}
  </label>;
}
function TextArea({ label, value, onChange, placeholder }) {
  return <label className="field full"><span>{label}</span><textarea rows="3" value={value || ""} placeholder={placeholder || `Enter ${label.toLowerCase()}`} onChange={e => onChange(e.target.value)} /></label>;
}
function SectionTitle({ eyebrow, title, desc }) {
  return <div className="section-title"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{desc && <p>{desc}</p>}</div>;
}
function Logo({ light = false }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="https://sahyadri.edu.in/"
      target="_blank"
      rel="noreferrer"
      aria-label="Sahyadri College of Engineering and Management"
    >
      <img
        className="brand-logo-image"
        src="https://www.sahyadri.edu.in/images/logo.svg"
        alt="Sahyadri College of Engineering & Management"
      />
    </a>
  );
}
function Status({ children }) { return <span className={`status ${clsStatus(children)}`}>{children}</span>; }
function Progress({ value }) {
  return <div className="progress-track"><div className="progress-value" style={{ width: `${value}%` }} /></div>;
}

export default function App() {
  const [db, setDb] = useState({
    students: seed,
    currentId: null,
  });

  const [view, setView] = useState("landing");
  const [studentId, setStudentId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [staffTab, setStaffTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  // Load saved data only after the component mounts in the browser.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORE);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed && Array.isArray(parsed.students)) {
          setDb({
            students: parsed.students,
            currentId: parsed.currentId || null,
          });

          setStudentId(parsed.currentId || null);
        }
      }
    } catch (error) {
      console.error("Unable to load saved admission data:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save only after localStorage has been loaded.
  useEffect(() => {
    if (!hydrated) return;

    saveStore(db);
  }, [db, hydrated]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const current = db.students.find(s => s.id === studentId) || null;
  const updateStudent = (id, patch) => setDb(prev => ({
    ...prev, students: prev.students.map(s => s.id === id ? { ...s, ...patch } : s)
  }));
  const updateNested = (key, field, value) => {
    if (!current) return;
    updateStudent(current.id, { [key]: { ...(current[key] || {}), [field]: value } });
  };
  const createStudent = (form) => {
    const id = `SCEM-2026-${String(Date.now()).slice(-5)}`;
    const student = { ...blankStudent, ...form, id, createdAt: today(), status: "Registered" };
    setDb(prev => ({ ...prev, students: [student, ...prev.students], currentId: id }));
    setStudentId(id);
    setView("confirmation");
    setToast("Registration created successfully");
  };
  const openStudent = (s) => { setStudentId(s.id); setStep(s.currentStep || 0); setView("application"); };
  const saveProgress = () => {
    if (!current) return;
    const progress = Math.min(95, Math.max(current.progress || 0, Math.round(((step + 1) / steps.length) * 100)));
    updateStudent(current.id, { currentStep: step, progress, status: "Application in progress" });
    setToast("Your progress has been saved");
  };
  const goStep = (next) => {
    if (!current) return;
    const progress = Math.max(current.progress || 0, Math.round((next / steps.length) * 100));
    updateStudent(current.id, { currentStep: next, progress, status: next === 0 ? current.status : "Application in progress" });
    setStep(next);
  };
  const submitApplication = () => {
    updateStudent(current.id, { submitted: true, progress: 100, currentStep: 10, status: "Submitted" });
    setView("payment");
    setToast("Application submitted successfully");
  };
  const confirmFee = (id) => {
    const student = db.students.find((s) => s.id === id);

    if (!student) return;

    if (!student.submitted) {
      setToast("Submit the application before confirming fees.");
      return;
    }

    if (student.paymentStatus === "Confirmed") {
      setToast("This student's fee is already confirmed.");
      return;
    }

    const admissionNumber = generateAdmissionNumber(
      db.students,
      student
    );

    const updatedStudent = {
      ...student,
      paymentStatus: "Confirmed",
      status: "Fee confirmed",
      admissionNumber,
    };

    updateStudent(id, {
      paymentStatus: "Confirmed",
      status: "Fee confirmed",
      admissionNumber,
    });

    setSelected(updatedStudent);
    setToast(`Fee confirmed. Admission number: ${admissionNumber}`);
  };
  const filtered = useMemo(() => db.students.filter(s => {
    const q = search.toLowerCase();
    const matches = `${s.name} ${s.id} ${s.email} ${s.phone} ${s.course}`.toLowerCase().includes(q);
    return matches && (filter === "All" || s.status === filter || s.paymentStatus === filter);
  }), [db.students, search, filter]);

  const navTo = (v) => { setView(v); setMobileMenu(false); setSelected(null); };
  const resetDemo = () => {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORE);
    setDb({ students: seed, currentId: null });
    setStudentId(null); setView("landing"); setToast("Demo data has been reset");
  };

  return <div className="app-shell">
    {view === "landing" && <Landing onRegister={createStudent} onStaff={() => navTo("staff")} canResume={!!current} onResume={() => { if (current?.admissionNumber) navTo("complete"); else if (current?.submitted) navTo("payment"); else { setStep(current?.currentStep || 0); navTo("application"); } }} />}
    {view === "confirmation" && current && <Confirmation student={current} onContinue={() => { setStep(0); navTo("application"); }} onStaff={() => navTo("staff")} />}
    {view === "application" && current && <StudentApplication student={current} step={step} setStep={goStep} onSave={saveProgress} onSubmit={submitApplication} onHome={() => navTo("landing")} updateNested={updateNested} updateStudent={updateStudent} toast={setToast} />}
    {view === "payment" && current && <Payment student={current} updateStudent={updateStudent} onHome={() => navTo("landing")} onStaff={() => navTo("staff")} toast={setToast} />}
    {view === "complete" && current && <Completion student={current} onHome={() => navTo("landing")} onStaff={() => navTo("staff")} />}
    {view === "staff" && <StaffDashboard students={db.students} tab={staffTab} setTab={setStaffTab} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} filtered={filtered} onHome={() => navTo("landing")} onOpen={s => { setSelected(s); }} onConfirm={confirmFee} onReset={resetDemo} onShowConfirmation={id => { setStudentId(id); navTo("complete"); }} />}
    {selected && view === "staff" && <StudentModal student={selected} onClose={() => setSelected(null)} onConfirm={() => confirmFee(selected.id)} onEdit={() => openStudent(selected)} onShowConfirmation={() => { setStudentId(selected.id); navTo("complete"); }} />}
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={() => setToast("")}><X size={15}/></button></div>}
  </div>;
}

function Landing({ onRegister, onStaff, canResume, onResume }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    course: "",
    programme: "B.E",
  });

  const [errors, setErrors] = useState({});

  const change = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    const validation = {};

    if (!form.name.trim()) validation.name = "Enter your name";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      validation.phone = "Enter a valid 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      validation.email = "Enter a valid email address";
    if (!form.course) validation.course = "Select your course";

    setErrors(validation);

    if (Object.keys(validation).length === 0) {
      onRegister(form);
    }
  };

  return (
    <div className="admission-page">

      {/* Official-style college header */}
      <div className="admission-contact-bar">
        <div className="admission-container contact-inner">
          <span><Mail size={13} /> info@sahyadri.edu.in</span>
          <span><Phone size={13} /> +91 824 2277222 / 333</span>
          <span className="college-code">BE CET CODE: E160</span>
          <div className="contact-links">
            <a href="https://www.sahyadri.edu.in/admission">Admission</a>
            <a href="https://www.sahyadri.edu.in/admission-open">Admission Open</a>
          </div>
        </div>
      </div>

      <header className="admission-header">
        <div className="admission-container header-inner">
          <Logo />

          <nav>
            <a href="https://www.sahyadri.edu.in/">Home</a>
            <a href="#programmes">Programmes</a>
            <a href="#admission-process">Admission Process</a>
            <a href="#eligibility">Eligibility</a>
            <a href="#enquiry">Contact</a>
          </nav>

          <button className="staff-link" onClick={onStaff}>
            <ShieldCheck size={15} /> Staff Login
          </button>
        </div>
      </header>

      {/* Admission page introduction */}
      <section className="admission-banner">
        <div className="admission-container">
          <div className="admission-breadcrumb">
            Home <span>/</span> Admissions
          </div>

          <p className="admission-overline">SAHYADRI COLLEGE OF ENGINEERING & MANAGEMENT</p>

          <h1>Admissions</h1>

          <p className="admission-banner-description">
            Begin your academic journey at Sahyadri College of Engineering
            & Management, Mangaluru.
          </p>

          <a href="#admission-process" className="admission-banner-link">
            Explore admission process <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Programmes */}
      <section className="admission-section" id="programmes">
        <div className="admission-container">
          <div className="admission-section-heading">
            <span>ACADEMIC PROGRAMMES</span>
            <h2>Programmes Offered</h2>
            <p>
              Explore the programmes offered by Sahyadri College of
              Engineering & Management.
            </p>
          </div>

          <div className="admission-programme-group">
            <h3>Undergraduate Programmes</h3>
            <div className="admission-course-list">
              {courses.map((course) => (
                <div className="admission-course-row" key={course}>
                  <div>
                    <GraduationCap size={19} />
                    <span>{course}</span>
                  </div>
                  <span className="course-duration">B.E. · 4 Years</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admission-note">
            For postgraduate and other programmes, refer to the
            <a href="https://www.sahyadri.edu.in/admission" target="_blank" rel="noreferrer">
              official programme information
            </a>.
          </div>
        </div>
      </section>

      {/* Admission process */}
      <section className="admission-section admission-section-alt" id="admission-process">
        <div className="admission-container">
          <div className="admission-section-heading">
            <span>HOW TO JOIN</span>
            <h2>Admission Procedure</h2>
            <p>
              B.E. admissions are conducted through the following admission routes.
            </p>
          </div>

          <div className="admission-route-list">
            <article className="admission-route">
              <div className="route-number">01</div>
              <div>
                <span className="route-share">45% of seats</span>
                <h3>Karnataka CET – KEA</h3>
                <p>
                  Seats are allotted by the Government of Karnataka through
                  the Common Entrance Test conducted by the Karnataka
                  Examinations Authority.
                </p>
                <strong>College code: E160</strong>
                <a href="https://kea.kar.nic.in/" target="_blank" rel="noreferrer">
                  KEA website <ArrowRight size={14} />
                </a>
              </div>
            </article>

            <article className="admission-route">
              <div className="route-number">02</div>
              <div>
                <span className="route-share">30% of seats</span>
                <h3>COMEDK Entrance Test</h3>
                <p>
                  Admission through COMEDK entrance examination and
                  centralised counselling.
                </p>
                <strong>College code: E112</strong>
                <a href="https://www.comedk.org/" target="_blank" rel="noreferrer">
                  COMEDK website <ArrowRight size={14} />
                </a>
              </div>
            </article>

            <article className="admission-route">
              <div className="route-number">03</div>
              <div>
                <span className="route-share">25% of seats</span>
                <h3>Management Quota</h3>
                <p>
                  Selection is subject to applicable government regulations,
                  application scrutiny, counselling and seat availability.
                </p>
                <strong>Direct admission enquiry</strong>
                <a href="#enquiry">
                  Submit an enquiry <ArrowRight size={14} />
                </a>
              </div>
            </article>
          </div>

          <p className="admission-disclaimer">
            Seat distribution and admission procedures are subject to
            applicable Government of Karnataka regulations and official
            admission notifications.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="admission-section" id="eligibility">
        <div className="admission-container eligibility-layout">
          <div>
            <div className="admission-section-heading">
              <span>BE ADMISSIONS</span>
              <h2>Eligibility</h2>
            </div>
            <p>
              Candidates should have passed the qualifying 10+2 / PUC
              examination with the prescribed subjects and aggregate marks
              as applicable to their category and admission route.
            </p>
            <p>
              Refer to the latest official admission notification for
              applicable eligibility conditions.
            </p>
          </div>

          <div className="eligibility-reference">
            <h3>Entrance examination</h3>
            <p>KCET · COMEDK · Management</p>
            <div className="reference-line">
              <span>BE CET College Code</span>
              <strong>E160</strong>
            </div>
            <a href="https://www.sahyadri.edu.in/admission" target="_blank" rel="noreferrer">
              View official admission details <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="admission-section admission-section-alt">
        <div className="admission-container">
          <div className="admission-section-heading">
            <span>BE ADMISSIONS</span>
            <h2>Documents Required</h2>
            <p>Keep the relevant documents ready during the admission process.</p>
          </div>

          <div className="admission-documents">
            {[
              "SSLC / 10th marks card",
              "PUC / 12th marks card",
              "CET / COMEDK scorecard, where applicable",
              "Transfer certificate",
              "Study certificate, where applicable",
              "Aadhaar card",
              "Caste and income certificates, where applicable",
              "Recent passport-size photographs",
            ].map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form — added below admission content */}
      <section className="admission-enquiry-section" id="enquiry">
        <div className="admission-container enquiry-layout">
          <div className="enquiry-intro">
            <span>TAKE THE FIRST STEP</span>
            <h2>Interested in joining Sahyadri?</h2>
            <p>
              Share your details with our admissions team. We will get in
              touch to guide you through the admission process.
            </p>

            <div className="enquiry-contact">
              <div><Phone size={17} /><span>+91 824 2277222 / 333</span></div>
              <div><Mail size={17} /><span>info@sahyadri.edu.in</span></div>
            </div>
          </div>

          <div className="enquiry-form-card">
            <div className="enquiry-form-heading">
              <div>
                <span>ADMISSIONS 2026–27</span>
                <h3>Admissions Inquiry</h3>
                <p>Enter your details to register your enquiry.</p>
              </div>
            </div>

            <form onSubmit={submit} className="enquiry-form">
              <Field
                label="Full name"
                value={form.name}
                onChange={(v) => change("name", v)}
                placeholder="Enter your full name"
                required
              />
              {errors.name && <small className="error">{errors.name}</small>}

              <div className="enquiry-two-fields">
                <div>
                  <Field
                    label="Email address"
                    type="email"
                    value={form.email}
                    onChange={(v) => change("email", v)}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && <small className="error">{errors.email}</small>}
                </div>

                <div>
                  <Field
                    label="Mobile number"
                    value={form.phone}
                    onChange={(v) => change("phone", v)}
                    placeholder="10-digit mobile number"
                    required
                  />
                  {errors.phone && <small className="error">{errors.phone}</small>}
                </div>
              </div>

              <div className="enquiry-two-fields">
                <Field
                  label="Programme"
                  value={form.programme}
                  onChange={(v) => change("programme", v)}
                  options={["B.E"]}
                  required
                />

                <Field
                  label="Preferred course"
                  value={form.course}
                  onChange={(v) => change("course", v)}
                  options={courses}
                  required
                />
              </div>

              {errors.course && <small className="error">{errors.course}</small>}

              <button type="submit" className="enquiry-submit">
                Submit Enquiry <ArrowRight size={16} />
              </button>

              <p className="enquiry-consent">
                By submitting this form, you authorize Sahyadri College of
                Engineering & Management, Mangaluru to contact you with
                admission updates via email, SMS, WhatsApp and voice call.
              </p>

              {canResume && (
                <button type="button" className="resume-link" onClick={onResume}>
                  Already registered? Resume your application
                </button>
              )}
            </form>
          </div>
        </div>
      </section>

      <footer className="admission-footer">
        <div className="admission-container footer-inner">
          <Logo light />
          <div>
            <strong>Sahyadri College of Engineering & Management</strong>
            <span>Sahyadri Campus, Adyar, Mangaluru, Karnataka, India – 575007</span>
            <span>+91 824 2277222 / 333 · info@sahyadri.edu.in</span>
          </div>
          <small>© Sahyadri College of Engineering & Management</small>
        </div>
      </footer>
    </div>
  );
}

function Confirmation({ student, onContinue, onStaff }) {
  return <div className="center-page"><div className="confirmation-card">
    <div className="success-icon"><Mail size={30}/></div><div className="eyebrow">REGISTRATION RECEIVED</div>
    <h1>You're one step closer, {student.name.split(" ")[0]}.</h1>
    <p>We have created your admission enquiry. In the live system, an application link will be sent to your registered email and mobile number.</p>
    <div className="summary-box"><div><span>Application reference</span><strong>{student.id}</strong></div><div><span>Registered email</span><strong>{student.email}</strong></div><div><span>Programme</span><strong>{student.programme} · {student.course}</strong></div></div>
    <div className="demo-note"><AlertCircle size={16}/> Demo mode: no real email or SMS is sent. Use the button below to simulate opening the application link.</div>
    <button className="btn primary full-btn" onClick={onContinue}>Open application form <ArrowRight size={17}/></button>
    <button className="text-button" onClick={onStaff}>Go to staff dashboard</button>
  </div></div>;
}

function StudentApplication({ student, step, setStep, onSave, onSubmit, onHome, updateNested, updateStudent, toast }) {
  const [showReview, setShowReview] = useState(false);
  const [fileNames, setFileNames] = useState(student.documents || {});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const val = (key, field) => student[key]?.[field] || "";
  const input = (key, field, label, options) => <Field label={label} value={val(key, field)} onChange={v => updateNested(key, field, v)} options={options}/>;
  const text = (key, field, label) => <TextArea label={label} value={val(key, field)} onChange={v => updateNested(key, field, v)}/>;
  const upload = (label, key) => <label className="upload-tile"><UploadCloud size={22}/><strong>{fileNames[key] || `Upload ${label}`}</strong><span>PDF, JPG or PNG · Demo upload</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
    const f = e.target.files?.[0]; if (!f) return;
    const next = { ...fileNames, [key]: f.name }; setFileNames(next); updateStudent(student.id, { documents: next }); toast(`${label} selected`);
  }}/></label>;
  const content = () => {
    if (step === 0) return <><SectionTitle eyebrow="STEP 01 · ADMISSION" title="Admission details" desc="Confirm the programme and choose the admission route applicable to you."/>
      <div className="form-grid">
        <Field label="Programme" value={student.programme} onChange={v => updateStudent(student.id,{programme:v})} options={["B.E"]}/>
        <Field label="Course / Branch" value={student.course} onChange={v => updateStudent(student.id,{course:v})} options={courses}/>
        <Field label="Admission route" value={student.route} onChange={v => updateStudent(student.id,{route:v})} options={routes} required/>
        <Field label="Admission category" value={val("personal","category")} onChange={v => updateNested("personal","category",v)} options={["General","Category 1","2A","2B","3A","3B","SC","ST"]}/>
      </div>
      {!student.route && <div className="inline-hint"><CircleHelp size={16}/> Select your admission route to display the relevant entrance examination fields.</div>}
    </>;
    if (step === 1) return <><SectionTitle eyebrow="STEP 02 · ABOUT YOU" title="Personal information" desc="Enter your details as they appear on your SSLC / 10th marks card."/><div className="form-grid">
      {input("personal","fullName","Full name")}{input("personal","dob","Date of birth")}
      {input("personal","gender","Gender",["Male","Female","Other"])}{input("personal","nationality","Nationality",["Indian","Foreign national"])}
      {input("personal","religion","Religion")}{input("personal","motherTongue","Mother tongue")}
      {input("personal","bloodGroup","Blood group",["A+","A-","B+","B-","AB+","AB-","O+","O-"])}
      {input("personal","caste","Caste")}{input("personal","actualGroup","Actual group",["General","Category 1","2A","2B","3A","3B","SC","ST"])}
      {input("personal","aadhaar","Aadhaar number")}{input("personal","residency","Residency",["Resident Indian","Foreigner"])}
      {input("personal","passport","Passport number")}{input("personal","visa","Visa valid up to")}
    </div></>;
    if (step === 2) return <><SectionTitle eyebrow="STEP 03 · FAMILY" title="Parent & guardian details" desc="Provide parent or guardian contact details for official communication."/><h3 className="subhead">Father's details</h3><div className="form-grid">
      {input("family","fatherName","Father's name")}{input("family","fatherQualification","Qualification")}
      {input("family","fatherOccupation","Occupation")}{input("family","fatherEmail","Email")}
      {input("family","fatherMobile","Mobile number")}{input("family","fatherWhatsapp","WhatsApp number")}
    </div><h3 className="subhead">Mother's details</h3><div className="form-grid">
      {input("family","motherName","Mother's name")}{input("family","motherQualification","Qualification")}
      {input("family","motherOccupation","Occupation")}{input("family","motherEmail","Email")}
      {input("family","motherMobile","Mobile number")}{input("family","motherWhatsapp","WhatsApp number")}
    </div><h3 className="subhead">Guardian (if applicable)</h3><div className="form-grid">
      {input("family","guardianName","Guardian's name")}{input("family","guardianRelation","Relationship")}
      {input("family","guardianMobile","Mobile number")}{input("family","annualIncome","Parents' annual income")}
    </div></>;
    if (step === 3) return <><SectionTitle eyebrow="STEP 04 · ADDRESS" title="Address details" desc="Enter your current and permanent residential addresses."/><h3 className="subhead">Present address</h3><div className="form-grid">
      {input("address","presentLine","Address")}{input("address","presentVillage","Village")}
      {input("address","presentTaluk","Taluk / City")}{input("address","presentDistrict","District")}
      {input("address","presentState","State")}{input("address","presentCountry","Country")}
      {input("address","presentPin","PIN code")}
    </div><h3 className="subhead">Permanent address</h3><div className="form-grid">
      {input("address","permanentLine","Address")}{input("address","permanentVillage","Village")}
      {input("address","permanentTaluk","Taluk / City")}{input("address","permanentDistrict","District")}
      {input("address","permanentState","State")}{input("address","permanentCountry","Country")}
      {input("address","permanentPin","PIN code")}
    </div></>;
    if (step === 4) return <><SectionTitle eyebrow="STEP 05 · CAMPUS LIFE" title="Facilities & activities" desc="Tell us about your campus facility preferences and interests."/><div className="form-grid">
      {input("facilities","hostel","Hostel required",["Yes","No"])}
      {input("facilities","collegeBus","College bus required",["Yes","No"])}
      {input("facilities","sportsInterest","Interested in sports activities?",["Yes","No"])}
      {input("facilities","culturalInterest","Interested in cultural activities?",["Yes","No"])}
      {input("facilities","sports","Sports / games interests")}
      {input("facilities","cultural","Cultural / literary interests")}
      {input("facilities","club","Mandatory personality development club",["Robotics / Programming","Automotive","Environmental","Other"])}
      {input("facilities","howHeard","How did you hear about Sahyadri?",["Sahyadri website","Social media","Student / Alumni","Staff","Newspaper","Friends / Relatives","Other"])}
    </div>{text("facilities","otherActivities","Other activities or achievements")}</>;
    if (step === 5) return <><SectionTitle eyebrow="STEP 06 · ACADEMICS" title="Qualifying examination & academic record" desc="Enter marks and academic history. Fields can be completed using your original marks cards."/><h3 className="subhead">Qualifying examination</h3><div className="form-grid">
      {input("academics","examType","Qualifying examination",["PUC / 12th","Diploma"])}
      {input("academics","board","Board / University")}
      {input("academics","institution","Institution name")}
      {input("academics","passingYear","Year of passing")}
      {input("academics","physics","Physics marks")}
      {input("academics","chemistry","Chemistry marks")}
      {input("academics","maths","Mathematics marks")}
      {input("academics","totalMarks","Total marks")}
      {input("academics","percentage","Percentage")}
      {input("academics","cgpa","CGPA (if applicable)")}
    </div><h3 className="subhead">Academic history</h3><div className="form-grid">
      {input("academics","sslcSchool","SSLC school")}
      {input("academics","sslcBoard","SSLC board")}
      {input("academics","sslcYear","SSLC passing year")}
      {input("academics","sslcMarks","SSLC marks / percentage")}
      {input("academics","pucCollege","PUC / Diploma institution")}
      {input("academics","pucYear","PUC / Diploma passing year")}
    </div></>;
    if (step === 6) return <><SectionTitle eyebrow="STEP 07 · ENTRANCE" title="Entrance examination details" desc="The fields below change according to your selected admission route."/>
      <div className="route-banner"><GraduationCap size={20}/><div><strong>{student.route || "Admission route not selected"}</strong><span>Selected admission route</span></div></div>
      {student.route === "Management" ? <div className="inline-hint"><CheckCircle2 size={17}/> Management route selected. Enter qualifying examination details in the previous step. Entrance allotment fields are not required in this demo.</div> :
      <div className="form-grid">
        {input("entrance","registrationNo",`${student.route || "Entrance"} registration number`)}
        {input("entrance","rank",`${student.route || "Entrance"} rank`)}
        {input("entrance","allotmentOrder","Admission / allotment order number")}
        {input("entrance","allotmentDate","Allotment date")}
        {input("entrance","verificationSlip","Verification slip number")}
        {input("entrance","confirmationSlip","Confirmation slip number")}
        {input("entrance","optionEntry","Option entry / college code")}
        {input("entrance","category","Entrance category")}
      </div>}
      {student.route === "DCET" && <div className="inline-hint">DCET applicants should provide diploma marks and semester details in Academic Details.</div>}
    </>;
    if (step === 7) return <><SectionTitle eyebrow="STEP 08 · DOCUMENTS" title="Upload your documents" desc="Upload clear copies. Original documents will be checked by the admission office."/><div className="upload-grid">
      {upload("SSLC / 10th marks card","sslc")}{upload("PUC / 12th marks card","puc")}{upload("Study certificate","study")}{upload("Transfer certificate","tc")}{upload("Aadhaar card","aadhaar")}{upload("Passport-size photographs","photo")}{upload("Caste certificate (if applicable)","caste")}{upload("Income certificate (if applicable)","income")}
      {student.route !== "Management" && <>{upload("Entrance score / rank card","rankCard")}{upload("Allotment order","allotment")}{upload("Verification / confirmation slip","verification")}</>}
      {student.route === "DCET" && upload("Diploma marks cards","diploma")}
    </div><div className="inline-hint"><FileCheck2 size={16}/> This is a prototype. Selected file names are stored locally; files are not uploaded to a server.</div></>;
    if (step === 8) return <><SectionTitle eyebrow="STEP 09 · DECLARATIONS" title="Undertakings & declarations" desc="Read and acknowledge the student and parent undertakings before submission."/><div className="declaration-card"><h3>Student undertaking</h3><p>I declare that the information furnished in this application is true and correct. I agree to abide by the rules, regulations, attendance requirements, code of conduct and fee payment conditions of Sahyadri College of Engineering & Management.</p><label className="checkline"><input type="checkbox" checked={!!val("declarations","studentAgree")} onChange={e => updateNested("declarations","studentAgree",e.target.checked)}/> I have read and agree to the student undertaking.</label></div><div className="declaration-card"><h3>Parent / guardian undertaking</h3><p>I undertake to support the student in complying with the institution's rules and regulations and accept the responsibilities described in the parent undertaking.</p><label className="checkline"><input type="checkbox" checked={!!val("declarations","parentAgree")} onChange={e => updateNested("declarations","parentAgree",e.target.checked)}/> I have read and agree to the parent / guardian undertaking.</label></div><div className="declaration-card"><h3>Information accuracy</h3><label className="checkline"><input type="checkbox" checked={!!val("declarations","accuracy")} onChange={e => updateNested("declarations","accuracy",e.target.checked)}/> I confirm that all details and uploaded documents are accurate to the best of my knowledge.</label></div></>;
    return <><SectionTitle eyebrow="STEP 10 · FINAL REVIEW" title="Review your application" desc="Check your details before submitting. You can return to any step to make changes."/><div className="review-list">
      <ReviewRow title="Admission details" value={`${student.route || "Route not selected"} · ${student.course}`} onEdit={() => setStep(0)}/>
      <ReviewRow title="Personal information" value={val("personal","fullName") || student.name} onEdit={() => setStep(1)}/>
      <ReviewRow title="Parent & guardian" value={val("family","fatherName") || "Details not entered"} onEdit={() => setStep(2)}/>
      <ReviewRow title="Address details" value={val("address","presentDistrict") || "Details not entered"} onEdit={() => setStep(3)}/>
      <ReviewRow title="Facilities & activities" value={val("facilities","hostel") ? `Hostel: ${val("facilities","hostel")}` : "Not completed"} onEdit={() => setStep(4)}/>
      <ReviewRow title="Academic details" value={val("academics","percentage") ? `${val("academics","percentage")}%` : "Not completed"} onEdit={() => setStep(5)}/>
      <ReviewRow title="Entrance details" value={student.route === "Management" ? "Management route" : val("entrance","registrationNo") || "Not entered"} onEdit={() => setStep(6)}/>
      <ReviewRow title="Documents" value={`${Object.keys(student.documents || {}).length} file(s) selected`} onEdit={() => setStep(7)}/>
      <ReviewRow title="Declarations" value={val("declarations","studentAgree") && val("declarations","parentAgree") && val("declarations","accuracy") ? "All acknowledged" : "Acknowledgements pending"} onEdit={() => setStep(8)}/>
    </div><div className="inline-hint"><AlertCircle size={16}/> Prototype note: fields are editable and saved locally. The final production version should enforce required fields and route-specific document rules.</div></>;
  };
  return <div className="portal-layout">
    <header className="portal-header"><button className="icon-btn" onClick={onHome}><ArrowLeft size={18}/></button><Logo/><div className="header-right"><span className="save-indicator"><span/> Draft saved locally</span><div className="avatar">{student.name.slice(0,1).toUpperCase()}</div></div></header>
    <div className="application-shell">
      <aside className="step-sidebar"><div className="sidebar-caption">YOUR APPLICATION</div><div className="student-mini"><div className="avatar large">{student.name.slice(0,1).toUpperCase()}</div><div><strong>{student.name}</strong><span>{student.id}</span></div></div>
        <div className="step-list">{steps.map((s,i)=><button key={s} className={`step-nav ${step===i?"active":step>i?"done":""}`} onClick={() => setStep(i)}><span className="step-dot">{step>i?<Check size={13}/>:String(i+1).padStart(2,"0")}</span><span>{s}</span>{step===i && <span className="step-current"/>}</button>)}</div>
        <div className="sidebar-help"><CircleHelp size={17}/><div><strong>Need help?</strong><span>Contact the admissions office</span></div></div>
      </aside>
      <main className="application-main"><div className="application-top"><div><span className="eyebrow">B.E. ADMISSIONS · 2026–27</span><h1>Application form</h1></div><div className="progress-summary"><strong>{Math.max(student.progress || 0, Math.round((step/10)*100))}%</strong><span>completed</span></div></div>
        <Progress value={Math.max(student.progress || 0, Math.round((step/10)*100))}/>
        <div className="form-panel">{content()}</div>
        <div className="form-actions"><button className="btn secondary" onClick={onSave}><Save size={16}/> Save progress</button><div className="action-right">{step>0 && <button className="btn ghost" onClick={() => setStep(step-1)}><ArrowLeft size={16}/> Previous</button>}{step<9 ? <button className="btn primary" onClick={() => setStep(step+1)}>Save & continue <ArrowRight size={16}/></button> : <button className="btn primary" onClick={() => setConfirmSubmit(true)}>Submit application <Check size={16}/></button>}</div></div>
        <div className="form-footer"><span><ShieldCheck size={14}/> Your information is kept confidential.</span><span>Step {step+1} of 10</span></div>
      </main>
    </div>
    {confirmSubmit && <div className="modal-backdrop"><div className="confirm-modal"><button className="modal-close" onClick={() => setConfirmSubmit(false)}><X/></button><div className="success-icon small"><ClipboardCheck/></div><h2>Submit your application?</h2><p>Once submitted, your application will move to the fee payment stage. You can still contact the admissions office for corrections.</p><div className="modal-actions"><button className="btn secondary" onClick={() => setConfirmSubmit(false)}>Go back</button><button className="btn primary" onClick={() => { setConfirmSubmit(false); onSubmit(); }}>Confirm submission <ArrowRight size={16}/></button></div></div></div>}
  </div>;
}
function ReviewRow({ title, value, onEdit }) { return <div className="review-row"><div><strong>{title}</strong><span>{value}</span></div><button className="text-button" onClick={onEdit}>Edit</button></div>; }

function Payment({ student, updateStudent, onHome, onStaff, toast }) {
  const [mode, setMode] = useState(student.paymentMode || "");
  const [onlineDone, setOnlineDone] = useState(false);
  const choose = m => { setMode(m); updateStudent(student.id, { paymentMode: m, status: "Payment pending", paymentStatus: "Pending" }); };
  const payOnline = () => {
    updateStudent(student.id, { paymentMode: "Online", paymentStatus: "Paid – awaiting officer confirmation", status: "Fee confirmation pending" });
    setOnlineDone(true); toast("Demo online payment successful");
  };
  return <div className="payment-page"><header className="portal-header"><button className="icon-btn" onClick={onHome}><ArrowLeft size={18}/></button><Logo/><div className="header-right"><span className="pill-label">APPLICATION SUBMITTED</span></div></header>
    <div className="payment-wrap"><div className="eyebrow">NEXT STEP · FEE PAYMENT</div><h1>Choose how you'd like to pay.</h1><p className="muted">Your application has been submitted. Select a payment method to continue the admission process.</p>
      <div className="payment-ref"><div><span>Application reference</span><strong>{student.id}</strong></div><div><span>Applicant</span><strong>{student.name}</strong></div><div><span>Admission route</span><strong>{student.route || "Not selected"}</strong></div></div>
      <div className="payment-options">
        <button className={`payment-option ${mode==="Counter"?"selected":""}`} onClick={() => choose("Counter")}><div className="option-icon"><Wallet/></div><div><strong>Pay at college counter</strong><span>Visit the college accounts / admission counter and complete the fee payment.</span><small>Officer will confirm receipt in the portal.</small></div><span className="radio-mark">{mode==="Counter"&&<Check size={13}/>}</span></button>
        <button className={`payment-option ${mode==="Online"?"selected":""}`} onClick={() => choose("Online")}><div className="option-icon"><CreditCard/></div><div><strong>Pay online</strong><span>Continue through a simulated online payment experience.</span><small>Officer confirmation is still required for admission finalisation.</small></div><span className="radio-mark">{mode==="Online"&&<Check size={13}/>}</span></button>
      </div>
      {mode==="Counter" && <div className="payment-next"><div className="pending-icon"><Clock3/></div><div><strong>Counter payment selected</strong><p>Please visit the college counter. Your admission officer will update the payment status after verifying the receipt.</p><Status>Pending</Status></div></div>}
      {mode==="Online" && !onlineDone && <div className="online-box"><div className="demo-note"><AlertCircle size={16}/> This is a simulated payment. No money will be collected.</div><button className="btn primary full-btn" onClick={payOnline}>Simulate successful payment <ArrowRight size={16}/></button></div>}
      {onlineDone && <div className="payment-next"><div className="success-icon small"><CheckCircle2/></div><div><strong>Payment submitted successfully</strong><p>Your payment is awaiting admission officer confirmation. Your admission number will be generated after confirmation.</p><Status>Pending</Status></div></div>}
      <div className="payment-actions"><button className="btn secondary" onClick={onHome}>Back to home</button><button className="btn primary" onClick={onStaff}>Open staff dashboard <ArrowRight size={16}/></button></div>
    </div>
  </div>;
}

function Completion({ student, onHome, onStaff }) {
  return <div className="center-page"><div className="confirmation-card"><div className="success-icon"><CheckCircle2 size={32}/></div><div className="eyebrow">ADMISSION CONFIRMED</div><h1>Welcome to Sahyadri, {student.name.split(" ")[0]}!</h1><p>Your fee has been confirmed by the admission office. Your admission number has been generated.</p><div className="admission-number"><span>YOUR ADMISSION NUMBER</span><strong>{student.admissionNumber}</strong></div><div className="summary-box"><div><span>Course</span><strong>{student.course}</strong></div><div><span>Payment method</span><strong>{student.paymentMode}</strong></div><div><span>Payment status</span><strong><Status>Confirmed</Status></strong></div></div><div className="demo-note"><AlertCircle size={16}/> Prototype confirmation only. This is not an official admission letter.</div><button className="btn primary full-btn" onClick={onHome}>Back to admission portal</button><button className="text-button" onClick={onStaff}>View staff dashboard</button></div></div>;
}

function StaffDashboard({ students, tab, setTab, search, setSearch, filter, setFilter, filtered, onHome, onOpen, onConfirm, onReset, onShowConfirmation }) {
  const total = students.length, submitted = students.filter(s => s.submitted).length;
  const pending = students.filter(s => s.paymentStatus !== "Confirmed").length;
  const confirmed = students.filter(s => s.paymentStatus === "Confirmed").length;
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    setDateLabel(today());
  }, []);
  const nav = [{name:"Overview",icon:LayoutDashboard},{name:"All applications",icon:Users},{name:"Payment verification",icon:Wallet},{name:"Reports",icon:Activity}];
  return <div className="staff-layout">
    <aside className="staff-sidebar"><div className="staff-brand"><Logo light/><span className="staff-label">ADMISSIONS OFFICE</span></div><div className="staff-nav-label">WORKSPACE</div>{nav.map(n=><button key={n.name} className={`staff-nav ${tab===n.name?"active":""}`} onClick={() => setTab(n.name)}><n.icon size={18}/>{n.name}</button>)}<div className="staff-sidebar-bottom"><div className="staff-profile"><div className="avatar">AO</div><div><strong>Admission Officer</strong><span>Staff workspace</span></div></div><button className="staff-nav" onClick={onHome}><LogOut size={17}/> Exit dashboard</button></div></aside>
    <main className="staff-main"><header className="staff-topbar"><div><div className="eyebrow">SAHYADRI · ADMISSIONS 2026–27</div><h1>{tab}</h1></div><div className="staff-top-actions"><button className="btn secondary reset-btn" onClick={onReset}><RefreshCw size={14}/> Reset demo</button><button className="icon-btn"><Bell size={18}/><i/></button><div className="avatar">AO</div></div></header>
      {tab==="Overview" && <><div className="welcome-row"><div><h2>Good afternoon, Admission Team</h2><p>Here's what's happening with B.E. admissions today.</p></div><span className="date-chip">{dateLabel}</span></div><div className="stats-grid">
        <Stat icon={Users} label="Total registrations" value={total} change="All registered candidates" tone="blue"/>
        <Stat icon={FileCheck2} label="Applications submitted" value={submitted} change={`${total ? Math.round(submitted/total*100) : 0}% of registrations`} tone="purple"/>
        <Stat icon={Clock3} label="Fees awaiting confirmation" value={pending} change="Requires officer action" tone="amber"/>
        <Stat icon={GraduationCap} label="Admissions confirmed" value={confirmed} change="Admission number generated" tone="green"/>
      </div><div className="dashboard-grid"><div className="panel"><div className="panel-heading"><div><h3>Recent applicants</h3><p>Latest student activity</p></div><button className="text-button" onClick={() => setTab("All applications")}>View all <ArrowRight size={14}/></button></div><StudentTable students={students.slice(0,5)} onOpen={onOpen}/></div><div className="panel route-panel"><div className="panel-heading"><div><h3>Applications by route</h3><p>Admission channel breakdown</p></div></div>{routes.map(r=>{const count=students.filter(s=>s.route===r).length;return <div className="route-stat" key={r}><div><span>{r}</span><strong>{count}</strong></div><Progress value={total?count/total*100:0}/></div>})}</div></div></>}
      {tab==="All applications" && <div className="panel table-panel"><div className="panel-heading"><div><h3>Student applications</h3><p>Track every candidate from registration to admission confirmation.</p></div><span className="count-chip">{filtered.length} records</span></div><div className="table-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ID, email or phone"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Registered</option><option>Application in progress</option><option>Submitted</option><option>Payment pending</option><option>Fee confirmation pending</option><option>Fee confirmed</option><option>Confirmed</option><option>Pending</option></select></div><StudentTable students={filtered} onOpen={onOpen} detailed/></div>}
      {tab==="Payment verification" && <div className="panel table-panel"><div className="panel-heading"><div><h3>Fee payment verification</h3><p>Confirm payments only after checking the payment receipt / transaction details.</p></div></div><StudentTable students={students.filter(s=>s.submitted)} onOpen={onOpen} payment/></div>}
      {tab==="Reports" && <div className="report-grid"><div className="panel"><h3>Admission summary</h3><div className="report-number">{total}</div><p>Total registered candidates</p><div className="report-line"><span>Submitted applications</span><strong>{submitted}</strong></div><div className="report-line"><span>Fee confirmed</span><strong>{confirmed}</strong></div><div className="report-line"><span>Pending fee confirmation</span><strong>{pending}</strong></div></div><div className="panel"><h3>Route-wise summary</h3>{routes.map(r=><div className="report-line" key={r}><span>{r}</span><strong>{students.filter(s=>s.route===r).length}</strong></div>)}</div></div>}
      <div className="staff-disclaimer"><AlertCircle size={15}/> Demonstration dashboard · Data is stored in this browser only. No real student records are connected.</div>
    </main>
  </div>;
}
function Stat({icon:Icon,label,value,change,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><small>{change}</small></div>; }
function StudentTable({ students, onOpen, detailed=false, payment=false }) {
  if (!students.length) return <div className="empty-state"><Users size={28}/><strong>No applications found</strong><span>Try changing your search or filter.</span></div>;
  return <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>COURSE / ROUTE</th>{detailed&&<th>PROGRESS</th>}<th>STATUS</th>{payment&&<th>PAYMENT</th>}<th></th></tr></thead><tbody>{students.map(s=><tr key={s.id}><td><div className="student-cell"><div className="avatar">{s.name?.slice(0,1)||"S"}</div><div><strong>{s.name || "New applicant"}</strong><span>{s.id} · {s.email}</span></div></div></td><td><strong className="course-name">{s.course}</strong><span className="table-sub">{s.route || "Route not selected"}</span></td>{detailed&&<td className="progress-cell"><div><Progress value={s.progress||0}/><span>{s.progress||0}%</span></div><small>{s.currentStep>=10?"Application complete":steps[s.currentStep] || "Not started"}</small></td>}<td><Status>{s.status}</Status></td>{payment&&<td><Status>{s.paymentStatus}</Status></td>}<td><button className="row-action" onClick={()=>onOpen(s)}>{payment?"Review":"View"} <ArrowRight size={14}/></button></td></tr>)}</tbody></table></div>;
}
function StudentModal({ student, onClose, onConfirm, onEdit, onShowConfirmation }) {
  const canConfirm = student.submitted && student.paymentStatus !== "Confirmed";
  return <div className="modal-backdrop" onClick={onClose}><div className="student-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><div className="eyebrow">STUDENT RECORD</div><h2>{student.name}</h2><span>{student.id}</span></div><button className="modal-close" onClick={onClose}><X/></button></div>
    <div className="modal-status-row"><Status>{student.status}</Status><span>{student.createdAt}</span></div>
    <div className="modal-details"><Detail label="Mobile" value={student.phone}/><Detail label="Email" value={student.email}/><Detail label="Course" value={student.course}/><Detail label="Programme" value={student.programme}/><Detail label="Admission route" value={student.route || "Not selected"}/><Detail label="Application progress" value={`${student.progress||0}% · ${student.currentStep>=10?"Complete":steps[student.currentStep] || "Not started"}`}/><Detail label="Payment mode" value={student.paymentMode || "Not selected"}/><Detail label="Payment status" value={student.paymentStatus}/><Detail label="Admission number" value={student.admissionNumber || "Not generated"}/></div>
    <div className="modal-section"><h3>Officer actions</h3><p>Review the student's application and verify payment before generating the admission number.</p><div className="modal-actions"><button className="btn secondary" onClick={onEdit}>Open application</button>{canConfirm&&<button className="btn primary" onClick={onConfirm}><CheckCircle2 size={16}/> Confirm fee & generate number</button>}</div>{student.admissionNumber&&<><div className="generated-number"><CheckCircle2 size={17}/> Admission number: <strong>{student.admissionNumber}</strong></div><button className="btn primary full-btn" onClick={onShowConfirmation}>View student admission confirmation <ArrowRight size={16}/></button></>}</div>
  </div></div>;
}
function Detail({label,value}) { return <div className="detail-item"><span>{label}</span><strong>{value || "—"}</strong></div>; }
