import React, { useState } from "react";
import { 
  Camera,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Star,
  Clock,
  Users,
  Award,
  Edit2,
  Save,
  X,
  CheckCircle,
  Calendar
} from "lucide-react";
import "../styles/Profile.css";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  const [profile, setProfile] = useState({
    fullName: "Dr. Sarah Johnson",
    title: "Senior Mathematics & Physics Tutor",
    email: "sarah.johnson@coursecompass.com",
    phone: "+27 82 123 4567",
    location: "Johannesburg, South Africa",
    bio: "Passionate educator with over 10 years of experience teaching Mathematics and Physics. I specialize in helping students prepare for university entrance exams and have helped over 200 students achieve their academic goals.",
    education: [
      {
        degree: "Ph.D. in Applied Mathematics",
        institution: "University of Cape Town",
        year: "2015"
      },
      {
        degree: "M.Sc. in Physics",
        institution: "University of Witwatersrand",
        year: "2012"
      }
    ],
    subjects: ["Mathematics", "Physics", "Calculus", "Mechanics"],
    hourlyRate: 350,
    rating: 4.9,
    totalStudents: 156,
    totalSessions: 892,
    experience: "10+ years",
    languages: ["English", "Afrikaans"],
    availability: {
      monday: ["09:00 - 12:00", "14:00 - 18:00"],
      tuesday: ["09:00 - 12:00", "14:00 - 18:00"],
      wednesday: ["09:00 - 12:00", "14:00 - 18:00"],
      thursday: ["09:00 - 12:00", "14:00 - 18:00"],
      friday: ["09:00 - 12:00", "14:00 - 17:00"],
      saturday: ["10:00 - 14:00"],
      sunday: []
    },
    certifications: [
      "Certified Mathematics Teacher",
      "Advanced Physics Teaching Certificate",
      "Online Teaching Specialist"
    ],
    reviews: [
      {
        id: 1,
        student: "Thabo Mokoena",
        rating: 5,
        comment: "Dr. Johnson is an amazing tutor! She explains complex concepts in a way that's easy to understand.",
        date: "2024-06-15"
      },
      {
        id: 2,
        student: "Lerato Ndlovu",
        rating: 5,
        comment: "Thanks to her, I improved my Physics grade from 60% to 85% in just 3 months!",
        date: "2024-06-10"
      },
      {
        id: 3,
        student: "Sipho Dlamini",
        rating: 5,
        comment: "Very patient and knowledgeable. Highly recommended!",
        date: "2024-05-28"
      }
    ]
  });

  const stats = [
    { icon: Users, label: "Students", value: profile.totalStudents },
    { icon: Clock, label: "Sessions", value: profile.totalSessions },
    { icon: Star, label: "Rating", value: profile.rating },
    { icon: Award, label: "Experience", value: profile.experience }
  ];

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <span>SJ</span>
              <button className="avatar-edit-btn">
                <Camera size={16} />
              </button>
            </div>
            <div className="profile-info">
              <h1>{profile.fullName}</h1>
              <p className="profile-title">{profile.title}</p>
              <div className="profile-meta">
                <span className="meta-item">
                  <MapPin size={14} />
                  {profile.location}
                </span>
                <span className="meta-item">
                  <Mail size={14} />
                  {profile.email}
                </span>
                <span className="meta-item">
                  <Phone size={14} />
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button 
              className="btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <><Save size={18} /> Save Changes</>
              ) : (
                <><Edit2 size={18} /> Edit Profile</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="profile-stats-bar">
        {stats.map((stat, idx) => (
          <div key={idx} className="profile-stat">
            <stat.icon size={20} />
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={activeTab === "about" ? "active" : ""}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
          <button 
            className={activeTab === "subjects" ? "active" : ""}
            onClick={() => setActiveTab("subjects")}
          >
            Subjects & Rates
          </button>
          <button 
            className={activeTab === "schedule" ? "active" : ""}
            onClick={() => setActiveTab("schedule")}
          >
            Schedule
          </button>
          <button 
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "about" && (
            <div className="about-section">
              <div className="content-grid">
                <div className="content-card">
                  <h3>Bio</h3>
                  {isEditing ? (
                    <textarea 
                      className="bio-input"
                      defaultValue={profile.bio}
                      rows={5}
                    />
                  ) : (
                    <p>{profile.bio}</p>
                  )}
                </div>

                <div className="content-card">
                  <h3>Education</h3>
                  <div className="education-list">
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="education-item">
                        <GraduationCap size={20} />
                        <div>
                          <span className="degree">{edu.degree}</span>
                          <span className="institution">{edu.institution}</span>
                          <span className="year">{edu.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-card">
                  <h3>Certifications</h3>
                  <div className="certifications-list">
                    {profile.certifications.map((cert, idx) => (
                      <div key={idx} className="certification-item">
                        <CheckCircle size={16} />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-card">
                  <h3>Languages</h3>
                  <div className="languages-list">
                    {profile.languages.map((lang, idx) => (
                      <span key={idx} className="language-tag">{lang}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subjects" && (
            <div className="subjects-section">
              <div className="content-card">
                <h3>Subjects I Teach</h3>
                <div className="subjects-grid">
                  {profile.subjects.map((subject, idx) => (
                    <div key={idx} className="subject-card">
                      <div className="subject-icon">
                        <GraduationCap size={24} />
                      </div>
                      <span className="subject-name">{subject}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="content-card">
                <h3>Hourly Rate</h3>
                <div className="rate-display">
                  <span className="rate-amount">R{profile.hourlyRate}</span>
                  <span className="rate-unit">/ hour</span>
                </div>
                <p className="rate-note">
                  This is your standard hourly rate. You can adjust this for specific students or packages.
                </p>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="schedule-section">
              <div className="content-card">
                <h3>Weekly Availability</h3>
                <div className="availability-grid">
                  {Object.entries(profile.availability).map(([day, slots]) => (
                    <div key={day} className="availability-day">
                      <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      <div className="day-slots">
                        {slots.length > 0 ? (
                          slots.map((slot, idx) => (
                            <span key={idx} className="time-slot">
                              <Clock size={12} />
                              {slot}
                            </span>
                          ))
                        ) : (
                          <span className="no-slots">Unavailable</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-section">
              <div className="content-card">
                <div className="reviews-header">
                  <h3>Student Reviews</h3>
                  <div className="rating-summary">
                    <Star size={24} className="star-icon" />
                    <span className="rating-value">{profile.rating}</span>
                    <span className="rating-count">({profile.reviews.length} reviews)</span>
                  </div>
                </div>
                <div className="reviews-list">
                  {profile.reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-avatar">
                          {review.student.charAt(0)}
                        </div>
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.student}</span>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={i < review.rating ? "filled" : ""}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
