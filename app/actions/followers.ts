'use server'

interface Follower {
    username: string;
    fid: number;
    pfp_url: string;
}

export async function getFollowersByAffinity(fid: number): Promise<Follower[]> {
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    if (!NEYNAR_API_KEY) {
        throw new Error('NEYNAR_API_KEY is not configured');
    }

    try {
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=5&sort_type=affinity_score`,
            {
                headers: {
                    'api_key': NEYNAR_API_KEY,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch followers: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        console.log(data.users);
        console.log(data.users[0]);

        // Transform the response to match our Follower interface
        return data.users.map((user: any) => ({
            username: user.user.username,
            fid: user.user.fid,
            pfp_url: user.user.pfp_url
        }));
    } catch (error) {
        console.error('Error fetching followers:', error);
        throw error;
    }
}

