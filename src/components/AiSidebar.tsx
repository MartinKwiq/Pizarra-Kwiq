"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { MessageSquare, Send, X, Bot, User, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

export function AiSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  return (
    <>
      <Button
        variant="primary"
        size="icon"
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-2xl hover:scale-110 transition-transform"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-96 bg-clickup-dark/95 backdrop-blur-xl border-l border-white/10 shadow-3xl transform transition-transform duration-500 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full uppercase">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-clickup-purple/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-clickup-purple" />
              <span className="font-bold text-sm tracking-widest">Asistente Kwiq IA</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                <Bot className="w-12 h-12 text-clickup-purple" />
                <p className="text-sm">¿Cómo puedo ayudarte con tu Pizarra de ClickUp hoy?</p>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  m.role === "user" ? "bg-white/10" : "bg-clickup-purple/20"
                )}>
                  {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-clickup-purple" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-xs leading-relaxed",
                  m.role === "user" ? "bg-white/10 text-white" : "bg-clickup-gray/50 text-gray-200 border border-white/5"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-clickup-dark">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5 focus-within:border-clickup-purple/30 transition-colors">
              <input
                className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-gray-500"
                value={input}
                onChange={handleInputChange}
                placeholder="Escribe un comando..."
                autoFocus
              />
              <Button type="submit" variant="ghost" size="icon" disabled={isLoading || !input}>
                <Send className={cn("w-4 h-4", isLoading ? "animate-pulse" : "text-clickup-purple")} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
