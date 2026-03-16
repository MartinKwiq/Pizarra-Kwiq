import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AiSidebar } from "@/components/AiSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pizarra Kwiq | ClickUp MCP Server",
  description: "Servidor MCP optimizado de ClickUp para agentes de IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={cn(inter.className, "bg-clickup-dark text-white antialiased")}>
        <div className="relative min-h-screen overflow-hidden">
          {/* Fondo gradiente sutil */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3e2b5e,transparent)] pointer-events-none" />
          
          <header className="relative z-10 border-b border-white/5 bg-clickup-dark/50 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-clickup-purple rounded-lg flex items-center justify-center font-bold text-lg">K</div>
                <span className="font-semibold tracking-tight text-xl">Pizarra Kwiq</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Documentación</a>
                <a href="#" className="hover:text-white transition-colors">Seguridad</a>
                <a href="https://github.com/clickup/mcp-server" target="_blank" className="hover:text-white transition-colors">Github</a>
              </nav>
            </div>
          </header>

          <main className="relative z-10">{children}</main>
          
          <AiSidebar />

          <footer className="relative z-10 border-t border-white/5 py-12 bg-clickup-dark/80">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              <p>&copy; 2026 Pizarra Kwiq. Todos los derechos reservados.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
