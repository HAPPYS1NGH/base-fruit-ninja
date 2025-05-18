"use client";

import { useEffect, useState } from 'react';
import { getLeaderboard, FruitNinjaScore } from '@/lib/supabase/db';
import Image from 'next/image';
import Link from 'next/link';

// Rank badge components
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <span className="text-3xl">👑</span>;
  } else if (rank === 2) {
    return <span className="text-2xl">🥈</span>;
  } else if (rank === 3) {
    return <span className="text-2xl">🥉</span>;
  }
  return <span className="text-xl font-bold text-gray-400">#{rank}</span>;
};

export default function LeaderboardPage() {
  const [scores, setScores] = useState<FruitNinjaScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await getLeaderboard(50); // Get top 50 scores
        setScores(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              🏆 Global Leaderboard
            </h1>
            <p className="text-white text-opacity-90">
              Top Fruit Ninja Warriors
            </p>
          </div>
          <Link 
            href="/"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-full transition-all transform hover:scale-105 flex items-center gap-2 font-semibold"
          >
            <span>🎮</span>
            <span>Play Game</span>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-purple-500 border-t-transparent rounded-full animate-spin-slow"></div>
            </div>
            <p className="text-gray-400 animate-pulse">Loading scores...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scores.map((score, index) => (
              <div 
                key={score.id}
                className={`
                  transform transition-all duration-200 hover:scale-[1.02]
                  ${index < 3 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-white/10' 
                    : 'bg-white/5 hover:bg-white/10'
                  } 
                  rounded-xl overflow-hidden backdrop-blur-sm
                `}
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    <RankBadge rank={index + 1} />
                  </div>

                  {/* Profile Picture */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={score.pfp_url || '/default-avatar.png'}
                      alt={score.username}
                      fill
                      className="rounded-full object-cover border-2 border-white/20"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {score.username || 'Anonymous Player'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      FID: {score.fid}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-xl sm:text-2xl font-bold">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                      {score.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {scores.length === 0 && (
              <div className="text-center py-16 bg-white/5 rounded-xl">
                <h3 className="text-2xl font-bold mb-2">No Scores Yet!</h3>
                <p className="text-gray-400 mb-6">
                  Be the first to claim your spot on the leaderboard.
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  <span>🎮</span>
                  <span>Play Now</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 