import api from "./api";

export const getMyAps = async (universityId) => {
  const response = await api.get(`/student/my-aps/${universityId}`);
  return response.data;
};

export const getQualifiedCourses = async (studentId) => {
  const response = await api.get(`/student/qualified-courses`);
  return response.data;
};
