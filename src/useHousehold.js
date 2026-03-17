import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function useHousehold() {
  const [todos, setTodos] = useState([]);
  const [householdId, setHouseholdId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wait for auth to be ready before setting householdId
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setHouseholdId(user.uid);
      } else {
        setHouseholdId(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  // Listen to Firestore tasks in real time
  useEffect(() => {
    if (!householdId) return;

    const q = query(
      collection(db, "todos"),
      where("householdId", "==", householdId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTodos(items);
      setLoading(false);
    });

    return unsub;
  }, [householdId]);

  async function addTodo(text, section) {
    if (!householdId) return;
    await addDoc(collection(db, "todos"), {
      text,
      section,
      done: false,
      completedAt: null,
      householdId,
      createdBy: auth.currentUser.email,
      createdAt: new Date().toISOString()
    });
  }

  async function toggleTodo(todo, done) {
    const ref = doc(db, "todos", todo.id);
    await updateDoc(ref, {
      done,
      completedAt: done ? new Date().toISOString() : null
    });
  }

  async function deleteTodo(id) {
    await deleteDoc(doc(db, "todos", id));
  }

  return { todos, loading, addTodo, toggleTodo, deleteTodo };
}