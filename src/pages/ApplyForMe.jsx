// src/pages/ApplyForMe.jsx
import React from "react";
import { CheckCircle2, FileText, Shield, BadgeCheck } from "lucide-react";

export default function ApplyForMe() {
  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Apply For Me</h1>
      <p style={{ marginTop: 8, opacity: 0.75 }}>
        We apply to universities on your behalf — you just upload documents once.
      </p>

      <div
        style={{
          marginTop: 14,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          padding: 16
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>Coming soon 🚀</div>
        <div style={{ marginTop: 6, opacity: 0.8 }}>
          Available from <b>15 March 2026</b>.
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14
          }}
        >
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={18} />
              <div style={{ fontWeight: 800 }}>What you’ll do</div>
            </div>
            <ul style={{ margin: "10px 0 0 18px", lineHeight: 1.7, opacity: 0.85 }}>
              <li>Select universities + programmes</li>
              <li>Upload your documents once</li>
              <li>Confirm your details</li>
              <li>Pay the service fee</li>
            </ul>
          </div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle2 size={18} />
              <div style={{ fontWeight: 800 }}>What we’ll handle</div>
            </div>
            <ul style={{ margin: "10px 0 0 18px", lineHeight: 1.7, opacity: 0.85 }}>
              <li>Complete applications correctly</li>
              <li>Submit to universities for you</li>
              <li>Track statuses in your dashboard</li>
              <li>Notify you if anything is missing</li>
              <li>Access to varsity student for course you want</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14
          }}
        >
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              padding: 14
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BadgeCheck size={18} />
              <div style={{ fontWeight: 800 }}>Pricing (preview)</div>
            </div>
            <p style={{ marginTop: 10, opacity: 0.8 }}>
              Pricing model coming soon:
            </p>
            <ul style={{ margin: "10px 0 0 18px", lineHeight: 1.7, opacity: 0.85 }}>
              <li><b>R***</b> — 1 university</li>
              <li><b>R***</b> — up to 5 universities</li>
              <li><b>R***</b> — up to 10 universities</li>
            </ul>
            <p style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
              University application fees (if any) are separate.
            </p>
          </div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              padding: 14
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Shield size={18} />
              <div style={{ fontWeight: 800 }}>Trust & privacy</div>
            </div>
            <ul style={{ margin: "10px 0 0 18px", lineHeight: 1.7, opacity: 0.85 }}>
              <li>Your documents are stored securely</li>
              <li>No sharing of ID numbers publicly</li>
              <li>We log every submission action</li>
              <li>You can delete/disable the service anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
