import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
import { getTeamTasks, getTask, createTask } from "@/lib/clickup";
import { NextRequest, NextResponse } from "next/server";

// Instancia global del servidor para mantener estado entre peticiones
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
 * GET: Inicia el stream SSE
 * POST: Envía mensajes al servidor
 */

let transport: SSEServerTransport | null = null;

export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Mock de 'res' de Node.js para SSEServerTransport
  const mockRes = {
    write: (data: string) => writer.write(encoder.encode(data)),
    end: () => writer.close(),
    on: () => {},
    once: () => {},
    emit: () => {},
    removeListener: () => {},
    setHeader: () => {},
  };

  transport = new SSEServerTransport("/api/mcp", mockRes as any);
  
  // Establecer la conexión en segundo plano
  server.connect(transport).catch(console.error);

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req: NextRequest) {
  if (!transport) {
    return NextResponse.json({ error: "No active SSE connection" }, { status: 400 });
  }

  const body = await req.json();
  // El transporte maneja la entrada (Request en MCP es un JSON)
  await transport.handlePostMessage(req as any, {} as any); 
  
  return NextResponse.json({ status: "ok" });
}
