"use client";

import { useEffect, useState } from 'react';
import { getLeaderboard, FruitNinjaScore } from '@/lib/supabase/db';
import Image from 'next/image';
import Link from 'next/link';
import Trophy from '@/app/components/ui/Trophy';

// Rank badge components
const RankBadge = ({ rank, size = 18 }: { rank: number, size?: number }) => {
  if (rank === 1) {
    return <div className='bg-[#FFD700] p-1 rounded-full'>
      <Trophy color="#fff"  size={size} />
    </div>
  } else if (rank === 2) {
    return <div className='bg-[#C0C0C0] p-1 rounded-full'>
      <Trophy color="#fff"  size={size} />
    </div>
  } else if (rank === 3) {
    return <div className='bg-[#CD7F32] p-1 rounded-full'>
      <Trophy color="#fff"  size={size} />
    </div>
  }
  return <span className="text-gray-500 text-sm ">{rank.toString().padStart(2, '0')}</span>;
};

export default function LeaderboardPage() {
  const [scores, setScores] = useState<FruitNinjaScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await getLeaderboard(20); // Get top 20 scores
          setScores(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatName = (name: string) => {
    return name.length > 15 ? name.slice(0, 13) + '..' : name;
  };

  return (
    <div  className={`bg-background  `} style={{
      backgroundImage: `url('/board.png')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>

        <div className="min-h-screen w-full max-w-xl mx-auto p-4 pt-0 flex flex-col">
      {/* Header Section */}
      <div className="bg-tangerine-500 rounded-xl p-4 mx-4 rounded-t-none mb-6 shadow-lg text-center">
        <h1 className="text-4xl text-white">Leaderboard</h1>
      </div>

      {/* Content Section */}
      <div className="flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-tangerine-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white animate-pulse">Loading scores...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scores.map((score, index) => (
              <div 
                key={score.id}
                className="bg-white rounded-xl shadow-md w-full "
              >
                {
                  index <3 ? 
                    <div className=" relative ">
                  <div className="absolute -top-2 -left-2 rotate-12 z-10 overflow-visible">
                  {/* Rank */}
                    <RankBadge rank={index + 1} />
                  </div>
                  <div className="flex items-center px-2 py-1 gap-3">

                    

                  {/* Profile Picture */}
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <Image
                      src={score.pfp_url || '/default-avatar.png'}
                      alt={score.username}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className=" text-[16px] font-inter font-bold text-black">
                      {formatName(score.name || score.username)}
                    </h3>
                    <p className="text-gray-400 text-sm font-inter">
                      @{score.username}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-5xl text-tangerine-500">
                    {score.score.toLocaleString()}
                  </div>
                  </div>
                </div>
                  :
                  <div className="flex items-center px-2 py-1 gap-3">
                  {/* Rank */}
                  <div className="flex-shrink-0 flex justify-center">
                    <RankBadge rank={index + 1} />
                  </div>

                  {/* Profile Picture */}
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <Image
                      src={score.pfp_url || '/default-avatar.png'}
                      alt={score.username}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className=" text-[16px] font-inter font-bold text-black">
                      {formatName(score.name || score.username)}
                    </h3>
                    <p className="text-gray-400 text-sm font-inter">
                      @{score.username}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-5xl text-tangerine-500">
                    {score.score.toLocaleString()}
                  </div>
                </div>
                }
                
              </div>
            ))}

            {scores.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <h3 className="text-2xl font-bold mb-2">No Scores Yet!</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to claim your spot on the leaderboard.
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 bg-tangerine-500 text-white px-6 py-3 rounded-full font-bold hover:bg-tangerine-600 transition-all"
                >
                  <span>🎮</span>
                  <span>Play Now</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Back button */}
      <Link 
        href="/"
        className="bg-tangerine-500 text-white px-6 py-3 rounded-xl mt-6 text-3xl text-center hover:bg-tangerine-600 transition-all"
      >
        Back to Game
      </Link>
    </div>
    </div>
  );
} 