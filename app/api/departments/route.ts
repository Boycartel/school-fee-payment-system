import { NextResponse } from "next/server"
import { getAllDepartments } from "@/lib/database"

export async function GET() {
  try {
    const departments = await getAllDepartments()
    return NextResponse.json({ departments })
  } catch (error) {
    console.error("Departments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
