"use client";

import {
  useMiniKit,
  useAddFrame,
  // useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { useEffect, useCallback } from "react";
import FruitNinjaGame from "./components/game/FruitNinjaGame";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  // const [activeTab, setActiveTab] = useState("home");

  const addFrame = useAddFrame();
  // const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    if (context && !context.client.added) {
      try {
        await addFrame();
      } catch (error) {
        console.error("Error adding frame:", error);
      }
    }
  }, [addFrame, context]);

  useEffect(() => {
    console.log("handleAddFrame called");
    handleAddFrame();
    // Prevent scrolling on the main game screen
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto  py-0 mt-0">
        <main className="flex-1">
          <FruitNinjaGame />
          {/* {activeTab === "home" && <FruitNinjaGame />}
          {activeTab === "leaderboard" && <LeaderboardPage />} */}
        </main>
      </div>
    </div>
  );
}
