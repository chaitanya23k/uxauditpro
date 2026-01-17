import { NextResponse } from "next/server"
import { adminDB } from "@/lib/firebaseAdmin"

export async function POST(req) {
  try {
    const { uid } = await req.json()
    if (!uid) return NextResponse.json({ error: "UID missing" }, { status: 400 })

    // ✅ Delete user document
    await adminDB.collection("users").doc(uid).delete()

    // ✅ Delete all reports of this user
    const reportsSnap = await adminDB.collection("reports").where("userId", "==", uid).get()
    const batch = adminDB.batch()

    reportsSnap.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
