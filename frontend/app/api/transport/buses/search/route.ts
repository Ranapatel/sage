import { NextRequest, NextResponse } from "next/server"
import { MakeMyTripProvider } from "@/providers/MakeMyTripProvider"

const provider = new MakeMyTripProvider()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { origin, destination, travelDate, passengers, members, adults, children } = body

    if (!origin || !destination || !travelDate) {
      return NextResponse.json(
        { error: "origin, destination, travelDate required" },
        { status: 400 }
      )
    }

    const totalPassengers = Number(passengers || members || (Number(adults || 1) + Number(children || 0))) || 1

    const result = await provider.searchBuses({
      origin,
      destination,
      travelDate,
      passengers: totalPassengers,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[API Route Bus Search error]:', err.message)
    return NextResponse.json({
      results: [],
      searchUrl: "https://www.makemytrip.com/bus-tickets/",
    })
  }
}
