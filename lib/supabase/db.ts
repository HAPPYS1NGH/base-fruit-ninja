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
    console.log("Saving high score");
    console.log("Score", score);
    console.log("FID", fid);
    console.log("Username", username);
    console.log("PFP URL", pfpUrl);
    try {
        // First get the current score
        const { data: currentData } = await supabase
            .from('fruit_ninja_scores')
            .select('score')
            .eq('fid', fid)
            .single();

        console.log("currentData", currentData);

        // Only update if there's no existing score or if the new score is higher
        if (!currentData || score > currentData.score) {
            console.log("Updating score in DB");

            const { error } = await supabase
                .from('fruit_ninja_scores')
                .update({
                    score,
                })
                .eq('fid', fid);
            if (error) throw error;
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
