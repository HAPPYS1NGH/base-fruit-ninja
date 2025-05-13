export interface NeynarFollowersResponse {
    users: FollowerUser[];
    next?: {
        cursor: string;
    };
}

export interface FollowerUser {
    object: 'follower';
    user: UserProfile;
}

export interface UserProfile {
    object: 'user';
    fid: number;
    username: string;
    display_name: string;
    custody_address: string;
    pfp_url: string;
    profile?: {
        bio?: {
            text: string;
            mentioned_profiles?: UserDehydrated[];
            mentioned_profiles_ranges?: Range[];
            mentioned_channels?: ChannelDehydrated[];
            mentioned_channels_ranges?: Range[];
        };
        location?: {
            latitude: number;
            longitude: number;
            address?: {
                city: string;
                state: string;
                state_code: string;
                country: string;
                country_code: string;
            };
        };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
        eth_addresses: string[];
        sol_addresses: string[];
        primary: {
            eth_address: string;
            sol_address: string;
        };
    };
    verified_accounts: {
        platform: string;
        username: string;
    }[];
    power_badge: boolean;
    experimental: {
        deprecation_notice?: string;
        neynar_user_score: number;
    };
    score: number;
    viewer_context: {
        following: boolean;
        followed_by: boolean;
        blocking: boolean;
        blocked_by: boolean;
    };
}

interface UserDehydrated {
    object: 'user_dehydrated';
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    custody_address: string;
}

interface ChannelDehydrated {
    id: string;
    name: string;
    object: 'channel_dehydrated';
    image_url: string;
    viewer_context: {
        following: boolean;
        role: string;
    };
}

interface Range {
    start: number;
    end: number;
} 