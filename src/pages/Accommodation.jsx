// src/pages/Accommodation.jsx
import React from "react";
import "./Accommodation.css";

export default function Accommodation() {
  return (
    <div className="acc-page">
      <div className="acc-wrap">
        {/* ✅ white wrapper */}
        <div className="acc-main">
          <div className="acc-head">
            <h1>Accommodation</h1>
            <p className="acc-sub">
              Coming soon — available from <b>1 July 2025</b>.
            </p>
          </div>

          <div className="acc-card">
            <h2>What you can expect</h2>

            <ul className="acc-list">
              <li>
                Browse <b>on-campus</b> and <b>off-campus</b> accommodation.
              </li>
              <li>
                See <b>prices</b>, photo galleries, and <b>student reviews</b>.
              </li>
              <li>
                Real-time availability: check if there’s <b>space</b> or not.
              </li>
              <li>Distance to your campus (km) + estimated travel time.</li>
              <li>
                See whether accommodation offers <b>free transport/shuttle</b> to campus.
              </li>
              <li>Filter by budget, room type, amenities, and location.</li>
            </ul>

            <div className="acc-tip">
              <b>Tip:</b> When we launch, you’ll be able to compare options side-by-side and save favourites.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
