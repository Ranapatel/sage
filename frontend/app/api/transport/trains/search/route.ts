import { NextRequest, NextResponse } from "next/server"
import { MakeMyTripProvider } from "@/providers/MakeMyTripProvider"

const provider = new MakeMyTripProvider()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { origin, destination, travelDate, passengers, members, adults, children, preferredClass } = body

    if (!origin || !destination || !travelDate) {
      return NextResponse.json(
        { error: "origin, destination, travelDate required" },
        { status: 400 }
      )
    }

    const totalPassengers = Number(passengers || members || (Number(adults || 1) + Number(children || 0))) || 1

    const result = await provider.searchTrains({
      originStation: origin,
      destinationStation: destination,
      travelDate,
      passengers: totalPassengers,
      preferredClass: preferredClass || "3A",
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[API Route Train Search error]:', err.message)
    return NextResponse.json({
      results: [],
      searchUrl: "https://www.makemytrip.com/railways/",
    })
  }
}
