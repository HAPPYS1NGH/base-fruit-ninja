"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Fruit, FRUITS, initializeFruitsWithFollowers } from "./Fruit";
import { Blade } from "./Blade";

// Game constants
const INITIAL_SPAWN_RATE = 1000; // ms
const MIN_SPAWN_RATE = 600; // ms
const SPAWN_RATE_DECREASE = 5; // ms
const GAME_DURATION = 60000; // 60 seconds

export default function FruitNinjaGame() {
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
  
  // Game loop function defined using useRef to avoid dependency issues
  const gameLoopRef = useRef<((timestamp: number) => void) | null>(null);
  
  // Initialize fruits with followers
  useEffect(() => {
    const initializeGame = async () => {
      // Replace this with the actual FID you want to use
      const targetFid = 429919; // Example FID
      await initializeFruitsWithFollowers(targetFid);
    };
    
    initializeGame();
  }, []);
  
  // End game
  const endGame = useCallback(() => {
    console.log("Game over");
    setGameOver(true);
    setGameStarted(false);
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('fruitNinjaHighScore', score.toString());
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [score, highScore]);
  
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
          
          // Check if it's a bomb
          if (fruit.name === "bomb") {
            // Game over if bomb is sliced
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
          
          lastSliceTimeRef.current = now;
        }
      }
    });
  }, [gameStarted, gameOver, endGame]);
  
  // Initialize game
  const startGame = useCallback(() => {
    console.log("Starting game");
    if (canvasRef.current) {
      // Reset game state
      setScore(0);
      setGameOver(false);
      setSpawnRate(INITIAL_SPAWN_RATE);
      fruitsRef.current = [];
      comboRef.current = 0;
      lastSliceTimeRef.current = 0;
      lastSpawnTimeRef.current = performance.now();
      gameStartTimeRef.current = performance.now();
      
      // Reset timer
      setTimeLeft(GAME_DURATION / 1000);
      
      // Adjust canvas size
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
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
  }, []);

  // Define game loop using useEffect and store in ref
  useEffect(() => {
    console.log("Setting up game loop function");
    
    // Define the game loop function - must be defined with the timestamp parameter
    gameLoopRef.current = (timestamp: number) => {
      if (!canvasRef.current || !gameStarted || gameOver) {
        return;
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate time left using high-precision timer
      const elapsedTime = (timestamp - gameStartTimeRef.current) / 1000;
      const newTimeLeft = Math.max(0, Math.ceil(GAME_DURATION / 1000 - elapsedTime));
      
      // Update time left
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft === 0) {
        endGame();
        return;
      }
      
      // Spawn fruits
      if (timestamp - lastSpawnTimeRef.current > spawnRate) {
        console.log("Attempting to spawn fruit:", {
          currentTime: timestamp,
          lastSpawnTime: lastSpawnTimeRef.current,
          timeSinceLastSpawn: timestamp - lastSpawnTimeRef.current,
          spawnRate
        });

        const fruitTypeIndex = Math.floor(Math.random() * FRUITS.length);
        // Limit bomb frequency (only 10% chance)
        if (FRUITS[fruitTypeIndex].name !== "bomb" || Math.random() < 0.1) {
          const newFruit = new Fruit(canvas.width, FRUITS[fruitTypeIndex]);
          fruitsRef.current.push(newFruit);
          console.log("Spawned fruit:", {
            type: FRUITS[fruitTypeIndex].name,
            x: newFruit.x,
            totalFruits: fruitsRef.current.length
          });
        } else {
          // Try again for a non-bomb
          const nonBombIndex = Math.floor(Math.random() * (FRUITS.length - 1));
          const newFruit = new Fruit(canvas.width, FRUITS[nonBombIndex]);
          fruitsRef.current.push(newFruit);
          console.log("Spawned non-bomb fruit:", {
            type: FRUITS[nonBombIndex].name,
            x: newFruit.x,
            totalFruits: fruitsRef.current.length
          });
        }
        lastSpawnTimeRef.current = timestamp;
        // Decrease spawn rate over time for increased difficulty
        setSpawnRate(prev => Math.max(MIN_SPAWN_RATE, prev - SPAWN_RATE_DECREASE));
      }
      
      // Update fruits
      fruitsRef.current.forEach((fruit) => {
        fruit.update();
      });
      
      // Remove fruits that are out of screen
      const beforeCount = fruitsRef.current.length;
      fruitsRef.current = fruitsRef.current.filter(
        (fruit) => {
          // Keep fruit if:
          // 1. It's still on screen (y < canvas.height + buffer)
          // 2. It's moving upward (velocityY < 0)
          // 3. It's sliced and within time window
          return (
            fruit.y < canvas.height + 100 || 
            fruit.velocityY < 0 ||
            (fruit.sliced && Date.now() - fruit.sliceTime < 1000)
          );
        }
      );
      const afterCount = fruitsRef.current.length;
      if (beforeCount !== afterCount) {
        console.log("Removed fruits:", {
          removed: beforeCount - afterCount,
          remaining: afterCount,
          fruits: fruitsRef.current.map(f => ({
            y: f.y,
            velocityY: f.velocityY,
            sliced: f.sliced
          }))
        });
      }
      
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
      animationFrameRef.current = requestAnimationFrame(gameLoopRef.current);
    }
    
    return () => {
      // Clean up animation frame on unmount or when dependencies change
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameStarted, gameOver, endGame]);

  // Adjust canvas size on mount and on window resize
  const adjustCanvasSize = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      console.log("Canvas size adjusted:", canvas.width, canvas.height);
    }
  }, []);

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

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 w-full rounded-lg shadow-lg mb-4">
        <div className="flex justify-between items-center text-white">
          <div>
            <p className="text-xl font-bold">Score: {score}</p>
            <p className="text-sm">High Score: {highScore}</p>
          </div>
          {gameStarted && (
            <div className="bg-white text-blue-600 px-3 py-1 rounded-full font-bold">
              {timeLeft}s
            </div>
          )}
        </div>
      </div>
      
      <div className="relative w-full" style={{ height: "60vh" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-gradient-to-b from-blue-900 to-black rounded-lg shadow-inner"
        />
        
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <h2 className="text-4xl font-bold text-white mb-6">Fruit Ninja</h2>
            <p className="text-white mb-8 text-center px-4">
              Slice fruits with your finger! <br />
              Avoid the bombs!
            </p>
            <button
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-green-600 hover:to-green-800 transform hover:scale-105 transition-all"
              onClick={startGame}
            >
              Start Game
            </button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
            <p className="text-2xl text-white mb-2">Score: {score}</p>
            <p className="text-lg text-white mb-8">High Score: {highScore}</p>
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all"
              onClick={startGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      
      <div className="text-center mt-4 text-sm text-gray-600">
        <p>Swipe to slice fruits • Avoid bombs • Get combos for extra points</p>
      </div>
    </div>
  );
}
