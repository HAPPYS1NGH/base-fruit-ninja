import supabase from './client';

export type FruitNinjaScore = {
    id: string;
    score: number;
    fid: number;
    username: string;
    pfp_url: string;
    created_at: string;
};

export async function saveHighScore(score: number, fid: number, username: string, pfpUrl: string): Promise<boolean> {
    try {
        // First get the current score
        const { data: currentData } = await supabase
            .from('fruit_ninja_scores')
            .select('score')
            .eq('fid', fid)
            .single();

        if (!currentData) {
            // No existing score, insert new record
            const { error: insertError } = await supabase
                .from('fruit_ninja_scores')
                .insert({
                    score,
                    fid,
                    username,
                    pfp_url: pfpUrl
                });

            if (insertError) throw insertError;
        } else if (score > currentData.score) {
            // Update only if new score is higher
            const { error: updateError } = await supabase
                .from('fruit_ninja_scores')
                .update({
                    score,
                    username,
                    pfp_url: pfpUrl
                })
                .eq('fid', fid);

            if (updateError) throw updateError;
        }

        return true;
    } catch (error) {
        console.error('Error saving high score:', error);
        return false;
    }
}

export async function getPlayerBestScore(fid: number): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('fruit_ninja_scores')
            .select('score')
            .eq('fid', fid)
            .order('score', { ascending: false })
            .limit(1);

        console.log("data", data);

        if (error) throw error;
        return data?.[0]?.score || 0;
    } catch (error) {
        console.error('Error fetching player best score:', error);
        return 0;
    }
}

export async function getLeaderboard(limit: number = 10): Promise<FruitNinjaScore[]> {
    try {
        const { data, error } = await supabase
            .from('fruit_ninja_scores')
            .select('*')
            .order('score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
} 
