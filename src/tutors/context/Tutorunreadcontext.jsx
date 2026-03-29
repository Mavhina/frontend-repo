import { createContext, useContext, useState } from "react";

const TutorUnreadContext = createContext(null);

export const TutorUnreadProvider = ({ children }) => {
  const [tutorUnreadCount, setTutorUnreadCount] = useState(0);
  return (
    <TutorUnreadContext.Provider value={{ tutorUnreadCount, setTutorUnreadCount }}>
      {children}
    </TutorUnreadContext.Provider>
  );
};

export const useTutorUnread = () => useContext(TutorUnreadContext);