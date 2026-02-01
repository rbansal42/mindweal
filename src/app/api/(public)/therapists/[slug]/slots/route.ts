import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";
import { bookingConfig } from "@/config";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const searchParams = request.nextUrl.searchParams;
        const date = searchParams.get("date");
        const duration = parseInt(searchParams.get("duration") || "60", 10);
        const timezone = searchParams.get("timezone") || bookingConfig.defaultTimezone;

        if (!date) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        const result = await getAvailableSlots(slug, date, duration, timezone);

        if (!result) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching slots:", error);
        return NextResponse.json(
            { error: "Failed to fetch slots" },
            { status: 500 }
        );
    }
}
