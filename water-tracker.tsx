"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CupSodaIcon as Cup, Droplet, RefreshCw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Cup sizes in ml
const CUP_SIZES = {
  small: 200,
  medium: 350,
  large: 500,
}

// Daily goal in ml (2.5 liters)
const DAILY_GOAL = 2500

export default function WaterTracker() {
  const [waterIntake, setWaterIntake] = useState(0)
  const [selectedCupSize, setSelectedCupSize] = useState<keyof typeof CUP_SIZES>("medium")
  const [showCelebration, setShowCelebration] = useState(false)

  // Load saved data from localStorage
  useEffect(() => {
    const savedIntake = localStorage.getItem("waterIntake")
    const savedDate = localStorage.getItem("waterIntakeDate")
    const today = new Date().toDateString()

    // If there's saved data from today, load it
    if (savedIntake && savedDate === today) {
      setWaterIntake(Number.parseInt(savedIntake))
      // Check if we should show celebration
      if (Number.parseInt(savedIntake) >= DAILY_GOAL && Number.parseInt(savedIntake) < DAILY_GOAL * 2) {
        setShowCelebration(true)
      }
    } else {
      // Reset for a new day
      localStorage.setItem("waterIntakeDate", today)
      localStorage.setItem("waterIntake", "0")
      setWaterIntake(0)
    }
  }, [])

  // Save to localStorage whenever intake changes
  useEffect(() => {
    localStorage.setItem("waterIntake", waterIntake.toString())

    // Show celebration when goal is reached exactly once
    if (waterIntake >= DAILY_GOAL && waterIntake < DAILY_GOAL * 2 && !showCelebration) {
      setShowCelebration(true)
    }
  }, [waterIntake, showCelebration])

  const addWater = () => {
    setWaterIntake((prev) => prev + CUP_SIZES[selectedCupSize])
  }

  const resetWater = () => {
    setWaterIntake(0)
    setShowCelebration(false)
  }

  const handleContinue = () => {
    // Add another daily goal amount when continuing
    setWaterIntake((prev) => prev + DAILY_GOAL)
    setShowCelebration(false)
  }

  // Calculate progress percentage, capped at 100% for the progress bar
  const progressPercentage = Math.min((waterIntake / DAILY_GOAL) * 100, 100)

  // Calculate how many times the daily goal has been reached
  const goalMultiplier = Math.floor(waterIntake / DAILY_GOAL)
  const extraMl = waterIntake - goalMultiplier * DAILY_GOAL

  // Format the progress text based on goal achievement
  const getProgressText = () => {
    if (waterIntake < DAILY_GOAL) {
      return `${Math.round(progressPercentage)}% of daily goal`
    } else if (waterIntake === DAILY_GOAL) {
      return "Daily goal achieved! 🎉"
    } else {
      return `Daily goal + ${extraMl} ml 🎉`
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              Daily Water Tracker
            </span>
            <Button variant="ghost" size="icon" onClick={resetWater} aria-label="Reset water intake">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Element 1: Progress Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{waterIntake} ml</span>
              <span>
                {goalMultiplier > 0 ? `${goalMultiplier}x ` : ""}
                {DAILY_GOAL} ml
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">{getProgressText()}</p>
          </div>

          {/* Element 2: Cup Size Selector */}
          <Tabs
            defaultValue="medium"
            className="w-full"
            onValueChange={(value) => setSelectedCupSize(value as keyof typeof CUP_SIZES)}
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="small">Small</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="large">Large</TabsTrigger>
            </TabsList>
            <TabsContent value="small" className="text-center text-sm text-muted-foreground">
              200 ml
            </TabsContent>
            <TabsContent value="medium" className="text-center text-sm text-muted-foreground">
              350 ml
            </TabsContent>
            <TabsContent value="large" className="text-center text-sm text-muted-foreground">
              500 ml
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter>
          {/* Element 3: Add Water Button */}
          <Button className="w-full" onClick={addWater} size="lg">
            <Cup className="mr-2 h-5 w-5" />
            Add Water ({CUP_SIZES[selectedCupSize]} ml)
          </Button>
        </CardFooter>

        {/* Element 4: Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm mx-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              >
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Goal Achieved!</h3>
              <p className="mb-4">You've reached your daily water intake goal of {DAILY_GOAL} ml!</p>
              <Button onClick={handleContinue} className="w-full">
                Continue (+{DAILY_GOAL} ml)
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

