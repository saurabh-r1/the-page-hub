import React from "react";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import { clearAuth } from "../utils/authStorage";

function Logout() {
  const [, setAuthUser] = useAuth();

  const handleLogout = () => {
    try {
      // clear centralized storage
      clearAuth();
      // clear context
      setAuthUser(null);

      toast.success("Logged out");

      // navigate to home quickly
      setTimeout(() => {
        window.location.href = "/";
      }, 250);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <button className="px-3 py-2 bg-red-500 text-white rounded-md cursor-pointer" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default Logout;
