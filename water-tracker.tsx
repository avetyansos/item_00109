"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { CupSodaIcon as Cup, Droplet, RefreshCw, CheckCircle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)
  const lastCelebratedGoal = useRef(0)

  // Load saved data from localStorage
  useEffect(() => {
    const savedIntake = localStorage.getItem("waterIntake")
    const savedDate = localStorage.getItem("waterIntakeDate")
    const savedLastCelebratedGoal = localStorage.getItem("lastCelebratedGoal")
    const today = new Date().toDateString()

    // If there's saved data from today, load it
    if (savedIntake && savedDate === today) {
      const parsedIntake = Number.parseInt(savedIntake)
      setWaterIntake(parsedIntake)

      if (savedLastCelebratedGoal) {
        lastCelebratedGoal.current = Number.parseInt(savedLastCelebratedGoal)
      }
    } else {
      // Reset for a new day
      localStorage.setItem("waterIntakeDate", today)
      localStorage.setItem("waterIntake", "0")
      localStorage.setItem("lastCelebratedGoal", "0")
      setWaterIntake(0)
      lastCelebratedGoal.current = 0
    }
  }, [])

  // Check if we've reached a new goal milestone
  useEffect(() => {
    const currentGoalMultiple = Math.floor(waterIntake / DAILY_GOAL)

    // If we've reached a new goal milestone and it's higher than the last celebrated goal
    if (currentGoalMultiple > 0 && currentGoalMultiple > lastCelebratedGoal.current) {
      setShowCelebration(true)
    }

    // Save water intake to localStorage
    localStorage.setItem("waterIntake", waterIntake.toString())
  }, [waterIntake])

  const addWater = () => {
    setWaterIntake((prev) => prev + CUP_SIZES[selectedCupSize])
  }

  const resetWater = () => {
    setWaterIntake(0)
    setShowCelebration(false)
    setShowResetConfirmation(false)
    lastCelebratedGoal.current = 0
    localStorage.setItem("lastCelebratedGoal", "0")
  }

  const handleContinue = () => {
    // Update the last celebrated goal
    const currentGoalMultiple = Math.floor(waterIntake / DAILY_GOAL)
    lastCelebratedGoal.current = currentGoalMultiple
    localStorage.setItem("lastCelebratedGoal", currentGoalMultiple.toString())

    // Hide the celebration without resetting water intake
    setShowCelebration(false)
  }

  // Calculate progress percentage, capped at 100% for the progress bar
  const progressPercentage = Math.min((waterIntake / DAILY_GOAL) * 100, 100)

  // Check if goal is achieved
  const isGoalAchieved = waterIntake >= DAILY_GOAL

  // Calculate how many times the daily goal has been reached
  const goalMultiplier = Math.floor(waterIntake / DAILY_GOAL)

  // Calculate extra ml beyond the current goal multiple
  const extraMl = waterIntake % DAILY_GOAL

  // Format the progress text based on goal achievement
  const getProgressText = () => {
    if (!isGoalAchieved) {
      return `${Math.round(progressPercentage)}% of daily goal`
    } else if (extraMl === 0) {
      return `${goalMultiplier}x daily goal achieved! 🎉`
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
            <Progress value={progressPercentage} className={`h-3 ${isGoalAchieved ? "bg-green-100" : ""}`} />
            <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
              {isGoalAchieved && <CheckCircle className="h-4 w-4 text-green-500" />}
              {getProgressText()}
            </div>
          </div>

          {/* Element 2: Cup Size Selector */}
          <Tabs
            defaultValue="medium"
            className="w-full"
            onValueChange={(value) => setSelectedCupSize(value as keyof typeof CUP_SIZES)}
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="small" className="px-1 sm:px-3">
                Small
              </TabsTrigger>
              <TabsTrigger value="medium" className="px-1 sm:px-3">
                Medium
              </TabsTrigger>
              <TabsTrigger value="large" className="px-1 sm:px-3">
                Large
              </TabsTrigger>
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

        <CardFooter className="flex flex-col sm:flex-row gap-2">
          {/* Element 3: Add Water Button */}
          <Button className="w-full" onClick={addWater} size="lg" disabled={isGoalAchieved}>
            <Cup className="mr-2 h-5 w-5" />
            Add Water ({CUP_SIZES[selectedCupSize]} ml)
          </Button>

          {/* Reset Button */}
          <Button
            className="w-full sm:w-auto"
            onClick={() => setShowResetConfirmation(true)}
            variant="outline"
            size="lg"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Reset
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
              <p className="mb-4">
                {goalMultiplier > 1
                  ? `You've reached ${goalMultiplier * DAILY_GOAL} ml (${goalMultiplier}x daily goal)!`
                  : `You've reached your daily water intake goal of ${DAILY_GOAL} ml!`}
              </p>
              <Button onClick={handleContinue} className="w-full">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetConfirmation} onOpenChange={setShowResetConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Water Tracker</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset your water intake to zero? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowResetConfirmation(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={resetWater}>
                Reset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

