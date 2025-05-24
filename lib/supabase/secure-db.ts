import supabaseAdmin from './admin';

export type SecureScoreData = {
    score: number;
    fid: number;
    username: string;
    pfpUrl: string;
    name: string;
};

// Secure function to save high score using admin client
export async function securelyProcessScore(scoreData: SecureScoreData): Promise<{
    success: boolean;
    error?: string;
    isNewHighScore?: boolean;
}> {
    try {
        const { score, fid, username, pfpUrl, name } = scoreData;

        // Validate input data
        if (!score || typeof score !== 'number' || score < 0) {
            return { success: false, error: 'Invalid score value' };
        }

        if (!fid || typeof fid !== 'number') {
            return { success: false, error: 'Invalid user ID' };
        }

        if (!username || typeof username !== 'string') {
            return { success: false, error: 'Invalid username' };
        }

        // Additional validation: Check if score is realistic (prevent impossible scores)
        const MAX_REASONABLE_SCORE = 1000; // 1 thousannd points max
        if (score > MAX_REASONABLE_SCORE) {
            return { success: false, error: 'Score exceeds maximum allowed value' };
        }

        // Check current score to see if this is a new high score
        const { data: currentData } = await supabaseAdmin
            .from('fruit_ninja_scores')
            .select('score')
            .eq('fid', fid)
            .single();

        let isNewHighScore = false;

        if (!currentData) {
            // No existing score, insert new record
            const { error: insertError } = await supabaseAdmin
                .from('fruit_ninja_scores')
                .insert({
                    score,
                    fid,
                    username,
                    name,
                    pfp_url: pfpUrl
                });

            if (insertError) {
                console.error('Error inserting new score:', insertError);
                return { success: false, error: 'Failed to save score' };
            }

            isNewHighScore = true;
        } else if (score > currentData.score) {
            // Update only if new score is higher
            const { error: updateError } = await supabaseAdmin
                .from('fruit_ninja_scores')
                .update({
                    score,
                    username,
                    name,
                    pfp_url: pfpUrl
                })
                .eq('fid', fid);

            if (updateError) {
                console.error('Error updating score:', updateError);
                return { success: false, error: 'Failed to update score' };
            }

            isNewHighScore = true;
        }

        return { success: true, isNewHighScore };
    } catch (error) {
        console.error('Error in securelyProcessScore:', error);
        return { success: false, error: 'Internal server error' };
    }
}

// Rate limiting helper (simple in-memory store - in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = rateLimitStore.get(identifier);

    if (!userLimit || now > userLimit.resetTime) {
        // First request or window expired
        rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (userLimit.count >= maxAttempts) {
        return false; // Rate limit exceeded
    }

    userLimit.count++;
    return true;
} 