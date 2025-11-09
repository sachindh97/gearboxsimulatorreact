import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

function App() {
  const [currentGear, setCurrentGear] = useState("N");
  const [speed, setSpeed] = useState(0);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [isClutchPressed, setIsClutchPressed] = useState(false);
  const [showClutchWarning, setShowClutchWarning] = useState(false);
  const intervalRef = useRef(null);

  const x = useMotionValue(83);
  const y = useMotionValue(60);

  const maxSpeedByGear = {
    R: -30,
    1: 20,
    2: 40,
    3: 70,
    4: 100,
    5: 150,
  };

  const playSound = (type) => {
    const audio = new Audio();
    if (type === "gear") {
      audio.src = "gear-shift.m4a";
    }
    audio.volume = 0.4;
    audio.play();
  };

  const positions = {
    1: { x: 18, y: 10 },
    2: { x: 18, y: 100 },
    3: { x: 83, y: 10 },
    4: { x: 83, y: 100 },
    5: { x: 148, y: 10 },
    R: { x: 148, y: 100 },
    N: { x: 83, y: 60 },
  };

  const moveToGear = (targetGear) => {
    if (!isClutchPressed) {
      // highlight clutch warning (no alert)
      setShowClutchWarning(true);
      setTimeout(() => setShowClutchWarning(false), 1500);
      return;
    }

    const current = positions[currentGear];
    const target = positions[targetGear];
    const neutral = positions["N"];

    if (current && target) {
      animate(x, neutral.x, { duration: 0.15 });
      animate(y, neutral.y, { duration: 0.15 });
      setTimeout(() => {
        animate(x, target.x, { duration: 0.25 });
        animate(y, target.y, { duration: 0.25 });
      }, 150);
    }

    setCurrentGear(targetGear);
    playSound("gear");
  };

  // Speed Control
  useEffect(() => {
    if ((isAccelerating || isBraking) && currentGear !== "N") {
      intervalRef.current = setInterval(() => {
        setSpeed((prev) => {
          if (isAccelerating) {
            const max = maxSpeedByGear[currentGear] || 0;
            if (currentGear === "R") return Math.max(max, prev - 1);
            // playSound("rev");
            return Math.min(max, prev + 1);
          } else if (isBraking) {
            if (prev > 0) return Math.max(0, prev - 2);
            if (prev < 0) return Math.min(0, prev + 2);
            return 0;
          }
          return prev;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAccelerating, isBraking, currentGear]);

  //  Smooth Deceleration When in Neutral
  useEffect(() => {
    if (currentGear === "N" && speed !== 0) {
      const slowDown = setInterval(() => {
        setSpeed((prev) => {
          if (prev > 0) return Math.max(0, prev - 1);
          if (prev < 0) return Math.min(0, prev + 1);
          return 0;
        });
      }, 100);
      return () => clearInterval(slowDown);
    }
  }, [currentGear, speed]);

  useEffect(() => {
  const isMobile =
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  if (isMobile) {
    alert("🚗 Please open on desktop for full driving experience (keyboard supported).");
  }
}, []);


  // Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === "a") setIsAccelerating(true);
      if (key === "b") setIsBraking(true);
      if (key === "c") setIsClutchPressed(true);
      if (["1", "2", "3", "4", "5", "r", "n"].includes(key)) {
        const gear = key === "n" ? "N" : key.toUpperCase();
        moveToGear(gear);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === "a") setIsAccelerating(false);
      if (key === "b") setIsBraking(false);
      if (key === "c") setIsClutchPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentGear, isClutchPressed]);

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center text-white">
      {/*  Animated Wave Background */}
      <motion.div
        className="absolute inset-0 bg-[url('/wavecut.png')] opacity-20"
        style={{
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPositionX: isAccelerating
            ? ["0%", "200%"]
            : isBraking
            ? ["200%", "0%"]
            : "0%",
        }}
        transition={{
          repeat: Infinity,
          duration: isAccelerating ? 2 : isBraking ? 3 : 8,
          ease: "linear",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-90" />

      <h1 className="text-2xl font-bold mb-6 relative z-10">
        🚗 Real Gearbox Simulator
      </h1>

      <div className="flex items-center gap-16 relative z-10">
        {/*  Gearbox */}
        <div className="relative bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-6 rounded-full shadow-2xl border-4 border-gray-600 w-[280px] h-[280px] flex items-center justify-center">
          <div className="relative w-[180px] h-[150px]">
            {/* H-Pattern */}
            <div className="absolute top-[20px] left-[25px] w-[3px] h-[90px] bg-gray-400"></div>
            <div className="absolute top-[20px] left-[90px] w-[3px] h-[90px] bg-gray-400"></div>
            <div className="absolute top-[20px] left-[155px] w-[3px] h-[90px] bg-gray-400"></div>
            <div className="absolute top-[65px] left-[25px] w-[130px] h-[3px] bg-gray-400"></div>

            {/* Gear Labels */}
            <GearLabel text="1" top={0} left={17} />
            <GearLabel text="2" top={105} left={17} />
            <GearLabel text="3" top={0} left={82} />
            <GearLabel text="4" top={105} left={82} />
            <GearLabel text="5" top={0} left={147} />
            <GearLabel text="R" top={105} left={150} />
            <GearLabel
              text="N"
              top={48}
              left={87}
              color="text-yellow-400 font-bold"
            />

            {/* Gear Knob */}
            <motion.div
              className="absolute w-5 h-5 bg-green-400 rounded-full shadow-md border-2 border-white"
              style={{ x, y }}
            ></motion.div>
          </div>
        </div>

        {/*  Speed Display */}
        <div className="relative flex flex-col items-center">
          <div
            className={`text-7xl font-extrabold tracking-widest ${
              isBraking
                ? "text-red-500"
                : isAccelerating
                ? "text-green-400"
                : "text-white"
            } transition-all duration-200`}
          >
            {Math.abs(speed).toFixed(0)}
          </div>
          <div className="text-xl text-gray-400">
            {currentGear === "N" ? "N" : `${currentGear} GEAR`} | KM/H
          </div>

          {/* Arrows */}
          {isAccelerating && (
            <>
              <Arrow color="text-green-500" side="right" />
              <Arrow color="text-green-500" side="left" reverse />
            </>
          )}
          {isBraking && (
            <>
              <Arrow color="text-red-500" side="right" />
              <Arrow color="text-red-500" side="left" reverse />
            </>
          )}
        </div>
      </div>

      {/*  Clutch Warning */}
      {showClutchWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: 1 }}
          className="mt-6 text-red-500 text-sm font-bold relative z-10"
        >
          ⚠️ Press Clutch (C) to Shift Gear!
        </motion.div>
      )}

      <div className="mt-6 text-gray-400 text-xs relative z-10">
        Controls: [A] Accelerate | [B] Brake | [C] Clutch | [1–5, R, N] Gears
      </div>
    </div>
  );
}

function GearLabel({ text, top, left, color = "text-white" }) {
  return (
    <div
      className={`absolute ${color} font-bold text-sm`}
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      {text}
    </div>
  );
}

function Arrow({ color, side, reverse }) {
  const position =
    side === "right" ? "absolute -right-6 top-2" : "absolute -left-6 top-6";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: [0, 1, 0], y: [-10, 0, 10] }}
      transition={{ repeat: Infinity, duration: 0.6 }}
      className={`${position} ${color} text-3xl font-bold ${
        reverse ? "rotate-180" : ""
      }`}
    >
      ➤
    </motion.div>
  );
}

export default App;
