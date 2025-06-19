"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TourStep {
  title: string;
  content: string;
  target?: string;
}

interface SimpleTourProps {
  steps: TourStep[];
  onComplete?: () => void;
}

export function SimpleTour({ steps, onComplete }: SimpleTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour && window.location.pathname === "/dashboard") {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenTour", "true");
    onComplete?.();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleSkip} />

      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle>{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{step.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Passo {currentStep + 1} de {steps.length}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleSkip}>
                Pular
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
