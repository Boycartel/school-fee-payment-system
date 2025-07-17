import { type NextRequest, NextResponse } from "next/server"
import { verifyPaymentByReference, verifyPaymentByEmail, verifyPaymentByMatricNumber } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { searchType, searchQuery } = await request.json()

    if (!searchType || !searchQuery) {
      return NextResponse.json({ error: "Search type and query are required" }, { status: 400 })
    }

    let payment = null

    switch (searchType) {
      case "reference":
        payment = await verifyPaymentByReference(searchQuery)
        break
      case "email":
        payment = await verifyPaymentByEmail(searchQuery)
        break
      case "matricNumber":
        payment = await verifyPaymentByMatricNumber(searchQuery)
        break
      default:
        return NextResponse.json({ error: "Invalid search type" }, { status: 400 })
    }

    if (!payment) {
      return NextResponse.json({ error: "No payment record found" }, { status: 404 })
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
