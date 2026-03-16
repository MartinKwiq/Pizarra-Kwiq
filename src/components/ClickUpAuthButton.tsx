"use client";

import { Button } from "./ui/Button";
import { Link2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function ClickUpAuthButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button 
      variant="primary" 
      size="lg" 
      className="gap-2 group transition-all duration-300 hover:scale-105"
      onClick={() => {
        setIsLoading(true);
        window.location.href = "/api/auth/clickup/authorize";
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Conectando...
        </span>
      ) : (
        <>
          <Link2 className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          Conectar con ClickUp
          <CheckCircle2 className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </Button>
  );
}
