"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const handleBack = () => {
  window.history.back();
};

const BackButton = () => {
  return (
    <Button variant="outline" onClick={handleBack} className="cursor-pointer">
      <ArrowLeft className="mr-2 w-4 h-4" />
      Volver Atras
    </Button>
  );
};

export default BackButton;
