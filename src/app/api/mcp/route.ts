import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
import { getTeamTasks, getTask, createTask } from "@/lib/clickup";
import { NextRequest, NextResponse } from "next/server";

// Instancia única del servidor
const server = new Server(
  {
    name: "clickup-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS: Tool[] = [
  {
    name: "list_tasks",
    description: "Lista todas las tareas de un workspace de ClickUp",
    inputSchema: {
      type: "object",
      properties: {
        teamId: { type: "string", description: "ID del workspace" },
      },
      required: ["teamId"],
    },
  },
  {
    name: "get_task",
    description: "Obtiene detalles de una tarea específica",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string", description: "ID de la tarea" },
      },
      required: ["taskId"],
    },
  },
  {
    name: "create_task",
    description: "Crea una nueva tarea en una lista de ClickUp",
    inputSchema: {
      type: "object",
      properties: {
        listId: { type: "string", description: "ID de la lista" },
        name: { type: "string", description: "Nombre de la tarea" },
        description: { type: "string" },
        status: { type: "string" },
      },
      required: ["listId", "name"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_tasks": {
        const tasks = await getTeamTasks(args?.teamId as string);
        return { content: [{ type: "text", text: JSON.stringify(tasks) }] };
      }
      case "get_task": {
        const task = await getTask(args?.taskId as string);
        return { content: [{ type: "text", text: JSON.stringify(task) }] };
      }
      case "create_task": {
        const task = await createTask(args?.listId as string, args);
        return { content: [{ type: "text", text: JSON.stringify(task) }] };
      }
      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

/**
 * Endpoint para MCP sobre SSE en Next.js
 */

let transport: SSEServerTransport | null = null;

export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Mock de respuesta para el transporte SSE
  const mockRes = {
    write: (data: string) => {
        try {
            writer.write(encoder.encode(data));
        } catch (e) {
            console.error("Error writing to SSE stream:", e);
        }
    },
    end: () => {
        try {
            writer.close();
        } catch (e) {
            console.error("Error closing SSE stream:", e);
        }
    },
    on: () => {},
    once: () => {},
    emit: () => {},
    removeListener: () => {},
    setHeader: (name: string, value: string) => {
        // En Next.js las cabeceras se pasan en el constructor de Response
    },
  };

  transport = new SSEServerTransport("/api/mcp", mockRes as any);
  
  // Conectar y manejar errores
  server.connect(transport).catch(err => {
      console.error("MCP Server connection error:", err);
      writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Importante para Vercel
    },
  });
}

export async function POST(req: NextRequest) {
  if (!transport) {
    return NextResponse.json({ error: "No active SSE connection" }, { status: 400 });
  }

  try {
    // El transporte de MCP espera un objeto que imite a http.IncomingMessage
    // En Next.js 14, req.json() consume el cuerpo.
    const body = await req.json();
    
    // Pasamos el cuerpo directamente al transporte si es posible, 
    // o enviamos el mensaje manualmente si el SDK lo permite.
    await transport.handlePostMessage(req as any, {} as any); 
    
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to handle MCP message" }, { status: 500 });
  }
}
