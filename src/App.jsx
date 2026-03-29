import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./layout/AppLayout";
import CourseMatch from "./pages/CourseMatch";
import FindTutors from "./pages/FindTutors";
import TutorProfile from "./pages/TutorProfile";
import UniversityGuides from "./pages/UniversityGuides";
import UniversityGuideDetails from "./pages/UniversityGuideDetails";
import BursariesPage from "./pages/BursariesPage";
import BursaryDetailsPage from "./pages/BursaryDetailsPage";
import FeeFundPage from "./pages/FeeFundPage";
import FeeFundWallOfSupport from "./pages/FeeFundWallOfSupport";
import ChatsPage from "./pages/ChatsPage";
import Accommodation from "./pages/Accommodation";
import Resources from "./pages/Resources";
import ApplyForMe from "./pages/ApplyForMe";
import RewardsPage from "./pages/RewardsPage";
import StudentMessages from "./pages/Studentmessages";

// Tutor pages
import TutorLayout from "./tutors/TutorLayout";
import TutorDashboard from "./tutors/pages/TutorDashboard";
import Students from "./tutors/pages/Students";
import Sessions from "./tutors/pages/Sessions";
import Earnings from "./tutors/pages/Earnings";
import Messages from "./tutors/pages/Messages";
import Profile from "./tutors/pages/Profile";
import Groups from "./tutors/pages/Groups";
import { UserProvider } from "./tutors/context/UserContext";
import { TutorUnreadProvider } from "./tutors/context/Tutorunreadcontext";
import BusinessProfile from "./tutors/pages/Businessprofile";


// placeholder pages
const APS = () => <div style={{ padding: 24 }}>APS Calculator page coming soon…</div>;
const Recommendations = () => <div style={{ padding: 24 }}>Recommendations page coming soon…</div>;

// Role-based redirect helper
export function RoleRedirect() {
  const token = localStorage.getItem("jwt");
  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const role = decoded.role || decoded.roles?.[0] || "";
    if (role === "TUTOR") return <Navigate to="/tutor/dashboard" replace />;
    return <Navigate to="/app/dashboard" replace />;
  } catch {
    return <Navigate to="/" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* STUDENT APP ROUTES */}
      <Route path="/app/*" element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="course-match" element={<CourseMatch />} />
        <Route path="tutors" element={<FindTutors />} />
        <Route path="tutors/:userId" element={<TutorProfile />} />
        <Route path="university-guides" element={<UniversityGuides />} />
        <Route path="university-guides/:universityId" element={<UniversityGuideDetails />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="aps" element={<APS />} />
        <Route path="bursaries" element={<BursariesPage />} />
        <Route path="bursaries/:id" element={<BursaryDetailsPage />} />
        <Route path="fee-fund" element={<FeeFundPage />} />
        <Route path="fee-fund/wall-of-support" element={<FeeFundWallOfSupport />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route path="accommodation" element={<Accommodation />} />
        <Route path="resources" element={<Resources />} />
        <Route path="apply-for-me" element={<ApplyForMe />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="messages" element={<StudentMessages />} />
      </Route>

      {/* TUTOR ROUTES */}
      <Route
        path="/tutor/*"
        element={
          <UserProvider>
            <TutorUnreadProvider>
              <TutorLayout />
            </TutorUnreadProvider>
          </UserProvider>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TutorDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="groups" element={<Groups />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="business-profile" element={<BusinessProfile />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Smart redirect based on role */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}