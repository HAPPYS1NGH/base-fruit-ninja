"use client";

import { useEffect, useState } from 'react';
import { getLeaderboard, FruitNinjaScore } from '@/lib/supabase/db';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            🏆 Fruit Ninja Leaderboard
          </h1>
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all transform hover:scale-105"
          >
            Play Game
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-black bg-opacity-50 rounded-lg shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 gap-4 p-6">
              {scores.map((score, index) => (
                <div 
                  key={score.id}
                  className={`flex items-center p-4 ${
                    index < 3 ? 'bg-gradient-to-r from-blue-900 to-blue-800' : 'bg-gray-900'
                  } rounded-lg transition-transform hover:scale-102 hover:shadow-lg`}
                >
                  <div className="flex-shrink-0 w-12 text-2xl font-bold text-center">
                    {index + 1}
                  </div>
                  <div className="flex-shrink-0 relative w-12 h-12 mr-4">
                    <Image
                      src={score.pfp_url || '/default-avatar.png'}
                      alt={score.username}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">
                      {score.username || 'Anonymous Player'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      FID: {score.fid}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-2xl font-bold text-yellow-400">
                    {score.score.toLocaleString()}
                  </div>
                </div>
              ))}

              {scores.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No scores recorded yet. Be the first to play!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 