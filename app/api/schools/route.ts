import { NextResponse } from "next/server"
import { getAllSchools } from "@/lib/database"

export async function GET() {
  try {
    const schools = await getAllSchools()
    return NextResponse.json({ schools })
  } catch (error) {
    console.error("Schools fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
