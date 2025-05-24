import { securelyProcessScore, checkRateLimit } from "@/lib/supabase/secure-db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Get client IP for rate limiting
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Rate limiting: max 10 requests per minute per IP
        if (!checkRateLimit(`score_${clientIP}`, 10, 60000)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { score, fid, username, pfpUrl, name } = body;

        // Additional rate limiting per user
        if (!checkRateLimit(`user_score_${fid}`, 5, 60000)) {
            return NextResponse.json(
                { error: "Too many score submissions. Please wait before submitting again." },
                { status: 429 }
            );
        }

        // Validate required fields
        if (typeof score !== 'number' || !fid || !username || !pfpUrl || !name) {
            return NextResponse.json(
                { error: "Missing required fields: score, fid, username, pfpUrl, name" },
                { status: 400 }
            );
        }

        // Additional server-side validations
        if (score < 0) {
            return NextResponse.json(
                { error: "Invalid score value" },
                { status: 400 }
            );
        }

        if (typeof fid !== 'number' || fid <= 0) {
            return NextResponse.json(
                { error: "Invalid user ID" },
                { status: 400 }
            );
        }

        // Process score securely using admin client
        const result = await securelyProcessScore({
            score,
            fid,
            username,
            pfpUrl,
            name
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to save score" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            isNewHighScore: result.isNewHighScore
        }, { status: 200 });

    } catch (error) {
        console.error("Error in secure score API:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
} 