import { NextRequest, NextResponse } from "next/server";
import { getAvailableDates } from "@/lib/slots";
import { bookingConfig } from "@/config";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const searchParams = request.nextUrl.searchParams;
        const duration = parseInt(searchParams.get("duration") || "60", 10);
        const timezone = searchParams.get("timezone") || bookingConfig.defaultTimezone;

        const result = await getAvailableDates(slug, duration, timezone);

        if (!result) {
            return NextResponse.json(
                { error: "Therapist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching availability:", error);
        return NextResponse.json(
            { error: "Failed to fetch availability" },
            { status: 500 }
        );
    }
}
