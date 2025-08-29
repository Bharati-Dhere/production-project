
import { useState } from "react";
import AuthModal from "../components/AuthModal";


const Auth = ({ onClose }) => {
  // Show the AuthModal as a modal overlay for login/signup
  return (
    <AuthModal role="user" onClose={onClose} />
  );
};

export default Auth;
