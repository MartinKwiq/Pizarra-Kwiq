import { GoogleGenerativeAI } from "@google/generative-ai";
import { StreamingTextResponse, GoogleGenerativeAIStream, tool } from "ai";
import { getTeamTasks } from "@/lib/clickup";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export const runtime = "nodejs"; // Cambiado a nodejs para usar fetch y crypto sin problemas de edge

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = `Actúa como un asistente inteligente para la Pizarra Kwiq. 
  Tienes acceso a la API de ClickUp mediante funciones.
  Puedes listar tareas del workspace y resumirlas. El team_id por defecto es el que el usuario te proporcione o el configurado.
  
  Instrucciones:
  1. Si te piden un resumen, usa la herramienta list_tasks.
  2. Si te piden crear una tarea, usa create_task (simulada por ahora).
  3. Sé premium y profesional.`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: systemPrompt
  });

  // Nota: La librería 'ai' versión 3.x con Gemini soporta herramientas de forma nativa.
  // Pero para simplificar en este entorno sin el setup completo de Vercel AI SDK 3.1+, 
  // usaremos el flujo de streaming básico aumentando el contexto en el prompt.

  const geminiMessages = messages.map((m: any) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContentStream({
    contents: geminiMessages,
  });

  const stream = GoogleGenerativeAIStream(result);
  return new StreamingTextResponse(stream);
}
