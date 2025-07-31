import { auth, provider } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  return { user, login, logout };
};