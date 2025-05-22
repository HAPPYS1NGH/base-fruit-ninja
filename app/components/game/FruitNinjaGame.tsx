"use client";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useRef, useState, useCallback } from "react";
import { Fruit, FRUITS, initializeFruitsWithFollowers } from "./Fruit";
import { Blade } from "./Blade";
import { saveHighScore, getPlayerBestScore, getLeaderboard } from '@/lib/supabase/db';
import Link from "next/link";
import { sdk } from '@farcaster/frame-sdk';
import Trophy from "../ui/Trophy";
import Image from "next/image";
// Game constants
const INITIAL_SPAWN_RATE = 800; // ms - Decreased from 1000 for more frequent spawns
// const MIN_SPAWN_RATE = 600; // ms
// const SPAWN_RATE_DECREASE = 0; // ms
const GAME_DURATION = 30000; // 60 seconds
const MAX_FRUITS_PER_SPAWN = 3; // Maximum number of fruits to spawn at once

export default function FruitNinjaGame() {
  const { context } = useMiniKit();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [highScore, setHighScore] = useState(0);
  const [spawnRate, setSpawnRate] = useState(INITIAL_SPAWN_RATE);
  const fruitsRef = useRef<Fruit[]>([]);
  const bladeRef = useRef(new Blade());
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const comboRef = useRef(0);
  const lastSliceTimeRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const [followerScores, setFollowerScores] = useState<{[key: string]: number}>({});
  const [isHighScore, setIsHighScore] = useState(false);
  
  // Game loop function defined using useRef to avoid dependency issues
  const gameLoopRef = useRef<((timestamp: number) => void) | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Initialize fruits with followers
  useEffect(() => {
    const initializeGame = async () => {
      if(context) {
        const targetFid = context.user.fid;
        await initializeFruitsWithFollowers(targetFid);
        // Get player's best score from DB
        const bestScore = await getPlayerBestScore(targetFid);
        setHighScore(bestScore);
      }
    };
    
    initializeGame();
  }, [context]);
  
  // End game
  const endGame = useCallback(async () => {
    console.log("Game over");
    setGameOver(true);
    setGameStarted(false);
    // For the time being, use a hardcoded FID and other details
    if (context && score > 0) {
      try {
        // Save score to DB
        console.log("Saving score to DB");
        
        const success = await saveHighScore(
          score,
          context.user.fid,
          context.user.username || 'Unknown',
          context.user.pfpUrl || '',
          context.user.displayName || context.user.username || 'Unknown' // Use displayName as name if available
        );
        console.log("Score saved to DB");
        console.log("Success", success);
        
        // Update high score if needed
        if (score > highScore) {
          setHighScore(score);
          setIsHighScore(true);
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [score, highScore, context]);
  
  // Check collision with blade
  const checkSlice = useCallback((x: number, y: number) => {
    if (!gameStarted || gameOver) return;
    fruitsRef.current.forEach((fruit) => {
      if (!fruit.sliced) {
        const distance = Math.sqrt(
          Math.pow(fruit.x - x, 2) + Math.pow(fruit.y - y, 2)
        );
        if (distance < fruit.radius) {
          fruit.slice();
          // Always play a new sound instance for every slice, allowing full overlap
          setTimeout(() => {
            const tempAudio = new window.Audio('/sliced.mp3');
            tempAudio.volume = 0.7;
            tempAudio.play();
          }, 0);
          // Check if it's a bomb
          if (fruit.name === "bomb") {
            endGame();
            return;
          }
          
          // Update score
          const now = Date.now();
          if (now - lastSliceTimeRef.current < 500) {
            comboRef.current++;
          } else {
            comboRef.current = 1;
          }
          
          // Bonus points for combos
          const pointsToAdd = fruit.points * Math.min(5, comboRef.current);
          setScore((prevScore) => prevScore + pointsToAdd);
          
          // Track individual follower scores
          setFollowerScores(prev => ({
            ...prev,
            [fruit.name]: (prev[fruit.name] || 0) + pointsToAdd
          }));
          
          lastSliceTimeRef.current = now;
        }
      }
    });
  }, [gameStarted, gameOver, endGame]);
  
  // Adjust canvas size on mount and on window resize
  const adjustCanvasSize = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = window.innerHeight - canvas.getBoundingClientRect().top - 20; // Set height to fill available space
      console.log("Canvas size adjusted:", canvas.width, canvas.height);
    }
  }, []);
  
  // Initialize game
  const startGame = useCallback(() => {
    console.log("Starting game");
    if (canvasRef.current) {
      // Reset game state
      setScore(0);
      setFollowerScores({});
      setGameOver(false);
      setSpawnRate(INITIAL_SPAWN_RATE);
      setIsHighScore(false);
      fruitsRef.current = [];
      comboRef.current = 0;
      lastSliceTimeRef.current = 0;
      lastSpawnTimeRef.current = performance.now();
      gameStartTimeRef.current = performance.now();
      
      // Reset timer
      setTimeLeft(GAME_DURATION / 1000);
      
      // Adjust canvas size - use the adjustCanvasSize function
      adjustCanvasSize();
      const canvas = canvasRef.current;
      console.log("Canvas size:", canvas.width, canvas.height);

      // Load high score from localStorage
      const savedHighScore = localStorage.getItem('fruitNinjaHighScore');
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore));
      }

      // Clear any existing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Force spawn a few fruits immediately
      for (let i = 0; i < 3; i++) {
        const fruitTypeIndex = Math.floor(Math.random() * (FRUITS.length - 1)); // Avoid bombs on start
        const newFruit = new Fruit(canvas.width, FRUITS[fruitTypeIndex]);
        fruitsRef.current.push(newFruit);
        console.log("Initial fruit spawned:", {
          type: FRUITS[fruitTypeIndex].name,
          x: newFruit.x,
          totalFruits: fruitsRef.current.length
        });
      }
      
      console.log("Initial fruits created:", fruitsRef.current.length);
      
      // Start the game
      setGameStarted(true);
      
      // Start the game loop immediately
      if (gameLoopRef.current) {
        console.log("Starting game loop");
        animationFrameRef.current = requestAnimationFrame(gameLoopRef.current);
      } else {
        console.error("Game loop not defined!");
      }
    }
  }, [adjustCanvasSize]);

  // Define game loop using useEffect and store in ref
  useEffect(() => {
    console.log("Setting up game loop function");
    
    // Define the game loop function - must be defined with the timestamp parameter
    gameLoopRef.current = (timestamp: number) => {
      if (!canvasRef.current || !gameStarted || gameOver) {
        return;
      }
      
      // Calculate delta time
      const deltaTime = lastFrameTimeRef.current ? timestamp - lastFrameTimeRef.current : 0;
      lastFrameTimeRef.current = timestamp;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate time left using high-precision timer
      const elapsedTime = (timestamp - gameStartTimeRef.current) / 1000;
      const newTimeLeft = Math.max(0, Math.ceil(GAME_DURATION / 1000 - elapsedTime));
      
      // Only update timeLeft state if it has changed
      if (newTimeLeft !== timeLeft) {
        setTimeLeft(newTimeLeft);
      }
      
      if (newTimeLeft === 0) {
        endGame();
        return;
      }
      
      // Spawn fruits
      if (timestamp - lastSpawnTimeRef.current > spawnRate) {
        // Randomly decide how many fruits to spawn (1 to MAX_FRUITS_PER_SPAWN)
        const fruitsToSpawn = Math.floor(Math.random() * MAX_FRUITS_PER_SPAWN) + 1;
        
        for (let i = 0; i < fruitsToSpawn; i++) {
          const fruitTypeIndex = Math.floor(Math.random() * FRUITS.length);
          // Limit bomb frequency (only 5% chance when spawning multiple)
          if (FRUITS[fruitTypeIndex].name !== "bomb" || Math.random() < (fruitsToSpawn === 1 ? 0.1 : 0.05)) {
            const newFruit = new Fruit(canvas.width, FRUITS[fruitTypeIndex]);
            // Add slight horizontal offset when spawning multiple fruits
            if (fruitsToSpawn > 1) {
              newFruit.x += (Math.random() - 0.5) * 100;
            }
            fruitsRef.current.push(newFruit);
          } else {
            // Try again for a non-bomb
            const nonBombIndex = Math.floor(Math.random() * (FRUITS.length - 1));
            const newFruit = new Fruit(canvas.width, FRUITS[nonBombIndex]);
            if (fruitsToSpawn > 1) {
              newFruit.x += (Math.random() - 0.5) * 100;
            }
            fruitsRef.current.push(newFruit);
          }
        }
        lastSpawnTimeRef.current = timestamp;
      }
      
      // Update fruits with delta time
      fruitsRef.current.forEach((fruit) => {
        fruit.update(deltaTime);
      });
      
      // Remove fruits that are out of screen
      fruitsRef.current = fruitsRef.current.filter(
        (fruit) => {
          const isVisible = fruit.y < canvas.height + 100 || 
                          fruit.velocityY < 0;
          const isRecentlySliced = fruit.sliced && 
                                 (timestamp - fruit.sliceTime) < 1000;
          return isVisible || isRecentlySliced;
        }
      );
      
      // Draw fruits
      fruitsRef.current.forEach((fruit) => {
        fruit.draw(ctx);
      });
      
      // Draw blade
      bladeRef.current.draw(ctx);
      
      // Continue the game loop
      animationFrameRef.current = requestAnimationFrame(gameLoopRef.current!);
    };
    
    // If game is already started, start the animation frame
    if (gameStarted && !gameOver && gameLoopRef.current) {
      lastFrameTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoopRef.current);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameStarted, gameOver, endGame, timeLeft, spawnRate]);

  // Handle canvas setup, game loop, and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up event handlers and adjust canvas size
    adjustCanvasSize();
    window.addEventListener('resize', adjustCanvasSize);
    
    // Start game loop if game is active
    if (gameStarted && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoopRef.current!);
    }
    
    // Event handlers
    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      bladeRef.current.active = true;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      bladeRef.current.addPoint(x, y);
      checkSlice(x, y);
    };
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!bladeRef.current.active) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      bladeRef.current.addPoint(x, y);
      checkSlice(x, y);
    };
    
    const handleEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      bladeRef.current.active = false;
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleStart as EventListener);
    canvas.addEventListener('mousemove', handleMove as EventListener);
    canvas.addEventListener('mouseup', handleEnd as EventListener);
    canvas.addEventListener('touchstart', handleStart as EventListener);
    canvas.addEventListener('touchmove', handleMove as EventListener);
    canvas.addEventListener('touchend', handleEnd as EventListener);
    
    // Clean up event listeners and animation frame
    return () => {
      window.removeEventListener('resize', adjustCanvasSize);
      canvas.removeEventListener('mousedown', handleStart as EventListener);
      canvas.removeEventListener('mousemove', handleMove as EventListener);
      canvas.removeEventListener('mouseup', handleEnd as EventListener);
      canvas.removeEventListener('touchstart', handleStart as EventListener);
      canvas.removeEventListener('touchmove', handleMove as EventListener);
      canvas.removeEventListener('touchend', handleEnd as EventListener);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [adjustCanvasSize, gameStarted, gameOver, checkSlice, spawnRate]);

  // Function to share score to feed
  const shareToFeed = async () => {
    try {
      // Get top victims from current game
      const topVictims = Object.entries(followerScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([username, score]) => {
          const fruit = FRUITS.find(f => f.name === username);
          return {
            username,
            score,
            pfp: fruit?.image || '',
            fid: fruit?.fid,
          };
        });

      // Get previous top scorer if this is a new high score
      let previousTopScorer = null;
      if (isHighScore && context) {
        try {
          const leaderboardData = await getLeaderboard(5);
          
          // Find the top scorer who isn't the current player
          previousTopScorer = leaderboardData.find(entry => 
            entry.fid !== context.user.fid && entry.score < score
          );
          
          console.log("Previous top scorer:", previousTopScorer);
        } catch (error) {
          console.error("Error fetching leaderboard for cast:", error);
        }
      }

      // Create the share URL with victims data
      const shareUrl = `${process.env.NEXT_PUBLIC_URL}/share?score=${score}&pfp=${context?.user.pfpUrl}`;
      console.log("Share URL:", shareUrl);

      // Create different cast text based on whether it's a new high score
      let castText = '';
      
      // if (isHighScore && previousTopScorer) {
      //   // New high score cast text with mention of previous record holder
      //   castText = `🏆 NEW HIGH SCORE: ${score.toLocaleString()} points! 🏆\n\n`;
      //   castText += `Sorry @${previousTopScorer.username}, your record has been broken! I'm the new champion! 👑\n\n`;
      //   castText += `Destroyed ${topVictims.length} faces in Facebreaker!\n\n`;
        
      //   // Add victims
      //   const mentions = topVictims
      //     .map(v => `@${v.username} (${v.score.toLocaleString()} pts)`)
      //     .join('\n');
      //   castText += `Victims:\n${mentions}\n\n`;
        
      //   castText += `Can you break my record? 🔥\n\nPlay now: ${shareUrl}`;
      // } else {
        // Regular cast text
        castText = `⚔️ Destroyed ${topVictims.length} faces in Facebreaker!\n\n`;
        castText += `Total Score: ${score.toLocaleString()}\n\n`;
        
        // Add victims
        const mentions = topVictims
          .map(v => `@${v.username} (${v.score.toLocaleString()} pts)`)
          .join('\n');
        castText += `Victims:\n${mentions}\n\n`;
        
        castText += `Can you break more? 🔥\n\nPlay now: ${shareUrl}`;
      // }

      // Use Farcaster Mini Apps SDK to open the cast composer
      await sdk.actions.composeCast({
        text: castText,
        embeds: [shareUrl]
      });

      // Send notification to all people who got cut (topVictims)
      for (const victim of topVictims) {
        if (victim.fid) {
          try { 
            fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
              fid: victim.fid,
              notification: {
                title: 'You got sliced!',
                body: `You were cut in Facebreaker by @${context?.user.username || 'someone'}!`,
                url: process.env.NEXT_PUBLIC_URL,
              },
            }),
          });
        } catch (error) {
          console.error('Error sending notification to victims :', victim.username,  error);
        }
      }
      }

      // If new high score, notify previous top scorer
      if (isHighScore && previousTopScorer && previousTopScorer.fid) {
        try {
          fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            fid: previousTopScorer.fid,
            notification: {
              title: 'Your record was broken!',
              body: `@${context?.user.username || 'Someone'} broke your Facebreaker record!`,
              url: process.env.NEXT_PUBLIC_URL,
            },
          }),
        });
      } catch (error) {
        console.error('Error sending notification to previous top scorer:', previousTopScorer.username, error);
      }}

      // Optionally, show a message or handle result
      // alert('Cast composer opened!');
    } catch (error) {
      console.error('Error sharing score:', error);
      alert('Failed to share score. Please try again.');
    }
  };

  return (
    // Dynamically render - splash-board for intial, and play-board for game
    
    <div  className={`bg-background  `} style={{
      backgroundImage: `url('${!gameStarted  && !gameOver ?  '/splash-board.png': '/play-board.png' }')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div className="w-full h-full flex flex-col items-center px-4">
      <div className="bg-tangerine-500 p-4 w-full rounded-lg rounded-t-none shadow-lg mb-4">
        <div className="flex justify-between items-center text-white">
          <div>
            <p className="text-2xl ">Score: {score}</p>
            <p className="text-lg">High Score: {highScore}</p>
          </div>
          
          {gameStarted ? (
            <div className="bg-white text-tangerine-500 px-6 py-2 rounded-full font-bold text-xl">
              {timeLeft}
            </div>
          ) : (
            <Link 
              href="/leaderboard"
              className="bg-white text-tangerine-500 px-4 py-2 rounded-full transition-all flex items-center  gap-2"
            >
              <Trophy color="#FF8011" size={17} />
              <span className="font-inter ">Leaderboard</span>
            </Link>
          )}
        </div>
      </div>
      
      <div className="relative w-full flex-grow flex" style={{ minHeight: "calc(100vh - 120px)" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg shadow-inner"
        />
        
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-tangerine-500 text-white text-center p-6 rounded-lg shadow-lg mb-4 max-w-xs flex items-center flex-col ">
              <Image src="/logo.png" alt="Face Breaker" width={70} height={70} />
              <h2 className="text-4xl mb-2">Face Breaker</h2>
              <p className="text-lg font-inter">
              Slice your followers!<br />
              Get combos for extra points 
              </p>
            </div>
            <button
              className="bg-white text-tangerine-500 px-16 py-4 max-w-xs rounded-lg text-3xl shadow-lg hover:bg-gray-100 transition-all text-center"
              onClick={startGame}
            >
              Start Game
            </button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto">

            <h2 className="text-3xl md:text-4xl text-white mb-2">GAME OVER</h2>
            <p className="text-3xl md:text-4xl text-white mb-4 font-bold">Total Score: {score}</p>
            {/* {isHighScore && (
              <p className="text-lg md:text-xl text-yellow-400 mb-2">🏆 New High Score! 🏆</p>
            )} */}
            
            {/* Top 3 Followers Scores */}
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-6 w-full flex flex-col items-center">
                <h3 className="text-2xl text-white font-bold mb-4 text-center font-gotens">Top Slices</h3>
                <div className="w-full flex flex-col gap-4 mb-6">
                  {Object.entries(followerScores)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([name, score], index) => {
                      const fruit = FRUITS.find(f => f.name === name);
                      return (
                        <div key={name} className="bg-white rounded-xl shadow-md w-full flex items-center px-2 py-1 gap-3">
                          {/* Rank */}
                          <div className="flex-shrink-0 flex justify-center">
                            <span className="text-gray-500 text-sm ">{(index+1).toString().padStart(2, '0')}</span>
                          </div>
                          {/* Profile Picture */}
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <img 
                              src={fruit?.image || '/default-avatar.png'} 
                              alt={name}
                              className="rounded-full object-cover w-10 h-10"
                            />
                          </div>
                          {/* User Info */}
                          <div className="flex-grow min-w-0">
                            <h3 className="text-[15px] font-inter font-bold text-black truncate">{name}</h3>
                          </div>
                          {/* Score */}
                          <div className="flex-shrink-0 text-3xl text-tangerine-500">
                            {score}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
                <div className="flex flex-col gap-3 w-full mt-2">
                  <button
                    className="bg-white text-tangerine-500 px-8 py-3 rounded-xl text-2xl md:text-xl shadow-lg hover:text-tangerine-600 transition-all mx-4 font-gotens"
                    onClick={startGame}
                  >
                    Play again
                  </button>
                  <button
                    className="bg-tangerine-500 text-white px-8 py-3 rounded-xl text-2xl md:text-xl shadow-lg hover:bg-tangerine-600 transition-all flex items-center justify-center gap-2 cursor-pointer font-gotens"
                    onClick={shareToFeed}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Score
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
