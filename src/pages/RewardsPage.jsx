import React from "react";
import { Trophy, Calendar, Gift, Star } from "lucide-react";
import "./RewardsPage.css";

export default function RewardsPage() {
  return (
    <div className="rw-wrap">
      <div className="rw-card">
        <div className="rw-head">
          <div className="rw-icon">
            <Trophy size={28} />
          </div>

          <div>
            <h1>Rewards & Competitions</h1>
            <p className="muted">
              Learn, compete, and win prizes while preparing for university.
            </p>
          </div>
        </div>

        <div className="rw-coming">
          🚀 Coming Soon — <strong>1 May 2026</strong>
        </div>

        <div className="rw-grid">
          <div className="rw-feature">
            <Star size={18} />
            <div>
              <div className="rw-title">Weekly Quizzes</div>
              <div className="rw-text">
                Test your knowledge on some subjects you do.
              </div>
            </div>
          </div>

          <div className="rw-feature">
            <Calendar size={18} />
            <div>
              <div className="rw-title">Term Competitions</div>
              <div className="rw-text">
                Compete across the term and climb the leaderboard. Top students
                earn recognition and rewards.
              </div>
            </div>
          </div>

          <div className="rw-feature">
            <Gift size={18} />
            <div>
              <div className="rw-title">Prizes to Win</div>
              <div className="rw-text">
                Data bundles, study vouchers, university merchandise, application fee, free varsity applications and
                more prizes.
              </div>
            </div>
          </div>
        </div>

        <div className="rw-prizes">
          <h2>Rewards</h2>

          <ul>
            <li>🥇 1st Place — Something interesting...</li>
            <li>🥈 2nd Place — Mmmmmmh</li>
            <li>🥉 3rd Place — Worth the wait</li>
            <li>🏅 Top 10 — It's comming and comming hot</li>
          </ul>
        </div>

        <div className="rw-note">
          Students will be ranked based on quiz scores and participation. Fair
          play and learning come first.
        </div>
      </div>
    </div>
  );
}
