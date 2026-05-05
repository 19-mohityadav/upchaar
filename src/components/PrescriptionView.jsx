import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase.js";
import "./PrescriptionView.css";

const UpcharLogo = () => (
  <div className="upchar-logo">
    <div className="upchar-icon">
      <svg width="72" height="88" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Phone body */}
        <rect x="10" y="6" width="46" height="76" rx="7" fill="white" stroke="#222" strokeWidth="2.5" />
        <rect x="14" y="14" width="38" height="56" rx="3" fill="#f5f5f5" />
        {/* Home button */}
        <circle cx="33" cy="76" r="3.5" fill="#ccc" />
        {/* Red cross */}
        <rect x="27" y="28" width="12" height="28" rx="2.5" fill="#E63946" />
        <rect x="20" y="35" width="26" height="12" rx="2.5" fill="#E63946" />
        {/* Hand icon overlay */}
        <ellipse cx="33" cy="42" rx="9" ry="9" fill="rgba(230,57,70,0.18)" />
        {/* Connected dots - network lines */}
        {/* Top dot */}
        <circle cx="33" cy="2" r="4" fill="#E63946" />
        {/* Right dots */}
        <circle cx="68" cy="20" r="4" fill="#E63946" />
        <circle cx="68" cy="44" r="4" fill="#E63946" />
        {/* Bottom dot */}
        <circle cx="33" cy="86" r="4" fill="#222" />
        {/* Left dots */}
        <circle cx="2" cy="30" r="3" fill="#333" />
        <circle cx="2" cy="55" r="3" fill="#333" />
        {/* Lines */}
        <line x1="33" y1="6" x2="33" y2="14" stroke="#222" strokeWidth="1.5" />
        <line x1="56" y1="10" x2="64" y2="18" stroke="#222" strokeWidth="1.5" />
        <line x1="56" y1="18" x2="64" y2="22" stroke="#222" strokeWidth="1.5" />
        <line x1="56" y1="44" x2="64" y2="44" stroke="#222" strokeWidth="1.5" />
        <line x1="10" y1="20" x2="5" y2="30" stroke="#222" strokeWidth="1.5" />
        <line x1="10" y1="55" x2="5" y2="55" stroke="#222" strokeWidth="1.5" />
        <line x1="33" y1="82" x2="33" y2="86" stroke="#222" strokeWidth="1.5" />
      </svg>
    </div>
    <div className="upchar-text">
      <span className="upchar-name">UPCHAR</span>
      <span className="upchar-health">HEALTH</span>
    </div>
  </div>
);

const ClockIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="16" stroke="#444" strokeWidth="2" />
    <line x1="18" y1="10" x2="18" y2="18" stroke="#444" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="18" x2="24" y2="22" stroke="#444" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="16" stroke="#444" strokeWidth="2" />
    <path d="M12 14c0-1.1.9-2 2-2h1l2 4-1.5 1.5c1 2 3 4 5 5L22 21l4 2v1c0 1.1-.9 2-2 2C14.3 26 12 19 12 14z" fill="#444" />
  </svg>
);

const LocationIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="16" stroke="#444" strokeWidth="2" />
    <path d="M18 10a6 6 0 0 1 6 6c0 4-6 11-6 11S12 20 12 16a6 6 0 0 1 6-6z" fill="#444" />
    <circle cx="18" cy="16" r="2" fill="white" />
  </svg>
);

const EmailIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="32" height="32" rx="4" stroke="#E63946" strokeWidth="2" fill="none" />
    <path d="M6 10l12 10L30 10" stroke="#E63946" strokeWidth="2" strokeLinecap="round" />
    <rect x="6" y="10" width="24" height="18" rx="1" stroke="#E63946" strokeWidth="1.5" fill="none" />
  </svg>
);

export default function PrescriptionView({ appointmentId }) {
  const { id: routeId } = useParams();
  const id = appointmentId || routeId;
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const { data: apt, error: aptErr } = await supabase
          .from("appointments")
          .select("*")
          .eq("id", id)
          .single();

        if (aptErr) throw aptErr;
        setAppointment(apt);

        if (apt.doctor_id) {
          const { data: doc } = await supabase
            .from("doctors")
            .select("*")
            .eq("id", apt.doctor_id)
            .single();
          setDoctor(doc);
        }

        if (apt.patient_id) {
          const { data: pat } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", apt.patient_id)
            .single();
          setPatient(pat);
        }
      } catch (err) {
        console.error("Error fetching prescription:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Loading prescription...</div>;
  }

  if (!appointment) {
    return <div className="p-8 text-center text-red-500">Prescription not found.</div>;
  }

  // Parse doctor name to highlight first part
  const docNameParts = (doctor?.full_name || appointment.doctor_name || "").split(" ");
  const firstName = docNameParts[0] || "Doctor";
  const lastName = docNameParts.slice(1).join(" ") || "";

  return (
    <div className="prescription-wrapper">
      <div className="prescription-page">
        {/* Corner Accents */}
        <div className="corner-accent top-right">
          <div className="accent-stripe red" />
          <div className="accent-stripe dark" />
        </div>
        <div className="corner-accent bottom-right">
          <div className="accent-stripe dark" />
          <div className="accent-stripe red" />
        </div>
        <div className="corner-accent bottom-left">
          <div className="accent-stripe teal" />
          <div className="accent-stripe dark" />
        </div>

        {/* Header */}
        <header className="rx-header">
          <div className="doctor-info">
            <h1 className="doctor-name">
              Dr. <span className="name-red">{firstName}</span> {lastName}
            </h1>
            <p className="doctor-degree">{doctor?.degrees || doctor?.qualifications || ""}</p>
            <p className="doctor-specialty">{doctor?.specialization || appointment.specialization || "Doctor"}</p>
            <p className="doctor-title">{doctor?.experience ? `${doctor.experience} Years Experience` : ""}</p>
            <p className="doctor-college">{doctor?.college || ""}</p>
          </div>
          <UpcharLogo />
        </header>

        {/* Divider with red bullet */}
        <div className="header-divider">
          <div className="divider-line" />
          <div className="divider-bullet" />
        </div>

        {/* Patient Fields */}
        <div className="patient-fields">
          <div className="field-group name-field">
            <label>Name:</label>
            <div className="field-line flex items-end pb-1 text-sm font-semibold pl-2">
              {patient?.full_name || appointment.patient_name || appointment.patient}
            </div>
          </div>
          <div className="field-group short-field">
            <label>Phone:</label>
            <div className="field-dots flex items-end pb-1 text-sm font-semibold pl-2 w-auto min-w-[100px]">
              {patient?.phone || appointment.patient_phone || "-"}
            </div>
          </div>
          <div className="field-group short-field">
            <label>Date:</label>
            <div className="field-line short flex items-end pb-1 text-sm font-semibold pl-2">
              {appointment.date ? new Date(appointment.date).toLocaleDateString() : "-"}
            </div>
          </div>
        </div>

        {/* Clinical History Section */}
        <div className="clinical-section">
          <div className="clinical-left pr-4 border-r-2 border-red-500/10 min-h-full">
            <h2 className="clinical-title mb-4">Clinical Notes:</h2>
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-medium">
              {appointment.diagnosis || appointment.issue || "No clinical notes provided."}
            </div>
          </div>
          <div className="clinical-right relative z-10 w-full pl-6 pt-2">
             <h2 className="clinical-title mb-4">Rx / Medicines:</h2>
             <div className="whitespace-pre-wrap text-sm text-gray-800 leading-loose">
               {(appointment.medicines && appointment.medicines.length > 0)
                  ? appointment.medicines.join("\n") 
                  : "No medicines prescribed."}
             </div>
          </div>
          
          {/* Watermark */}
          <div className="watermark">
            <div className="watermark-icon">
              <svg width="180" height="200" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.07">
                <rect x="10" y="6" width="46" height="76" rx="7" fill="#1A9E9E" stroke="#1A9E9E" strokeWidth="2" />
                <rect x="27" y="28" width="12" height="28" rx="2.5" fill="#E63946" />
                <rect x="20" y="35" width="26" height="12" rx="2.5" fill="#E63946" />
                <circle cx="33" cy="2" r="4" fill="#E63946" />
                <circle cx="68" cy="20" r="4" fill="#E63946" />
                <circle cx="68" cy="44" r="4" fill="#E63946" />
                <circle cx="33" cy="86" r="4" fill="#222" />
                <circle cx="2" cy="30" r="3" fill="#333" />
                <circle cx="2" cy="55" r="3" fill="#333" />
              </svg>
            </div>
            <div className="watermark-text">
              <span>UPCHAR</span>
              <span>HEALTH</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="rx-footer">
          {doctor?.clinic_timing && (
            <div className="footer-item">
              <span className="footer-icon"><ClockIcon /></span>
              <div className="footer-content">
                <span className="footer-label">Timing:</span>
                <span className="footer-main"> {doctor.clinic_timing}</span>
              </div>
            </div>
          )}

          {doctor?.phone && (
            <div className="footer-item">
              <span className="footer-icon"><PhoneIcon /></span>
              <div className="footer-content">
                <span className="footer-label">For Appointments:</span>
                <span className="footer-main"> Call</span>
                <br />
                <span className="teal-text phone-text">{doctor.phone}</span>
              </div>
            </div>
          )}

          {doctor?.clinic_address && (
            <div className="footer-item">
              <span className="footer-icon"><LocationIcon /></span>
              <div className="footer-content">
                <span className="footer-label">Address:</span>
                <span className="footer-main"> {doctor.clinic_address}</span>
              </div>
            </div>
          )}

          {doctor?.email && (
            <div className="footer-item email-item">
              <span className="footer-icon"><EmailIcon /></span>
              <div className="footer-content">
                <span className="footer-label">Email:</span>
                <span className="footer-email"> {doctor.email}</span>
              </div>
            </div>
          )}
        </footer>

        {/* Bottom corner accent bar */}
        <div className="bottom-bar">
          <div className="bar-teal" />
          <div className="bar-dark" />
          <div className="bar-red" />
        </div>
      </div>
    </div>
  );
}
