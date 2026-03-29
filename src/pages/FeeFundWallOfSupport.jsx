import React from "react";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./FeeFundWallOfSupport.css";

export default function FeeFundWallOfSupport() {
  const navigate = useNavigate();

  return (
    <div className="ws-wrap">
      <div className="ws-top">
        <button className="ws-back" onClick={() => navigate(-1)} type="button">
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="ws-card">
        <div className="ws-icon">
          <HeartHandshake size={26} />
        </div>

        <h1>Wall of Support</h1>
        <p>
          We’ll display all supporters and the amount they’ve contributed to help
          students pay registration fees.
        </p>

        <div className="ws-soon">🚧 Coming Soon</div>

        <button className="ws-primary" onClick={() => navigate("/app/fee-fund")} type="button">
          Go back to Fee Fund
        </button>
      </div>
    </div>
  );
}
