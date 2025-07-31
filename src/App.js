import { useState, useEffect } from 'react';
import { db, auth, provider } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import './styles.css';

const gradeToPoint = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'F': 0,
};

function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ subject: '', grade: '', credit: '' });
  const [editMap, setEditMap] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadSubjects(u.uid);
    });
    return () => unsub();
  }, []);

  async function loadSubjects(uid) {
    const q = query(collection(db, 'subjects'), where('owner', '==', uid));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSubjects(data);
    const edits = {};
    data.forEach(s => edits[s.id] = { ...s });
    setEditMap(edits);
  }

  async function addSubject() {
    const { subject, grade, credit } = formData;
    if (!subject || !grade || !credit || !user) return;
    const newEntry = {
      subject,
      grade,
      credit: Number(credit),
      owner: user.uid
    };
    const docRef = await addDoc(collection(db, 'subjects'), newEntry);
    setSubjects([...subjects, { ...newEntry, id: docRef.id }]);
    setEditMap(prev => ({ ...prev, [docRef.id]: newEntry }));
    setFormData({ subject: '', grade: '', credit: '' });
  }

  async function deleteSubject(id) {
    await deleteDoc(doc(db, 'subjects', id));
    setSubjects(subjects.filter(s => s.id !== id));
  }

  async function updateSubject(id) {
    const updated = editMap[id];
    if (!updated.subject || !updated.grade || !updated.credit) return;
    await updateDoc(doc(db, 'subjects', id), updated);
    setSubjects(subjects.map(s => (s.id === id ? updated : s)));
  }

  function calculateGPA() {
    let totalCredits = 0;
    let totalPoints = 0;
    subjects.forEach(({ grade, credit }) => {
      const point = gradeToPoint[grade.toUpperCase()] || 0;
      totalCredits += Number(credit);
      totalPoints += point * Number(credit);
    });
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  }

  if (!user)
    return (
      <div className="auth-box">
        <button className="btn" onClick={() => signInWithPopup(auth, provider)}>
          Sign in with Google
        </button>
      </div>
    );

  return (
    <div className="container">
      <div className="header">
        <button className="logout" onClick={() => signOut(auth)}>Logout</button>
        <h1 className="title">🎓 GPA / CGPA Calculator</h1>
      </div>

      <div className="inputform">
        <input
          type="text"
          placeholder="Subject"
          value={formData.subject}
          onChange={e => setFormData({ ...formData, subject: e.target.value })}
        />
        <input
          type="text"
          placeholder="Grade (e.g., A+)"
          value={formData.grade}
          onChange={e => setFormData({ ...formData, grade: e.target.value })}
        />
        <input
          type="text"
          placeholder="Credits"
          value={formData.credit}
          onChange={e => setFormData({ ...formData, credit: e.target.value })}
        />
        <button className="add" onClick={addSubject}>Add</button>
      </div>

      <div className="notes-list">
        {subjects.map((s) => (
          <div key={s.id} className="eachTask">
            <input
              type="text"
              value={editMap[s.id]?.subject || ''}
              onChange={e =>
                setEditMap(prev => ({ ...prev, [s.id]: { ...prev[s.id], subject: e.target.value } }))
              }
              placeholder="Subject"
            />
            <input
              type="text"
              value={editMap[s.id]?.grade || ''}
              onChange={e =>
                setEditMap(prev => ({ ...prev, [s.id]: { ...prev[s.id], grade: e.target.value } }))
              }
              placeholder="Grade"
            />
            <input
              type="text"
              value={editMap[s.id]?.credit || ''}
              onChange={e =>
                setEditMap(prev => ({ ...prev, [s.id]: { ...prev[s.id], credit: Number(e.target.value) } }))
              }
              placeholder="Credit"
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn mini save" onClick={() => updateSubject(s.id)}>💾</button>
              <button className="btn mini delete" onClick={() => deleteSubject(s.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="title">📊 GPA: {calculateGPA()}</h2>
    </div>
  );
}

export default App;
