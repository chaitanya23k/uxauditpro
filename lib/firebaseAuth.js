import { auth, db } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

export async function firebaseSignup({ name, email, password, role }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  const userData = {
    uid: user.uid,
    name,
    email,
    role,
    plan: role === "agency" ? "agency" : role === "admin" ? "admin" : "free",
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, "users", user.uid), userData)

  return userData
}

export async function firebaseLogin({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  const snap = await getDoc(doc(db, "users", user.uid))
  return snap.data()
}

export async function firebaseLogout() {
  await signOut(auth)
}
