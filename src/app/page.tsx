import { ClickUpAuthButton } from "@/components/ClickUpAuthButton";
import { Zap, ShieldCheck, Database, LayoutPanelLeft } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100-4rem)] pt-20 pb-32 px-4">
      <div className="text-center space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-clickup-purple/10 border border-clickup-purple/20 rounded-full text-clickup-purple text-xs font-semibold mb-4">
          <Zap className="w-3 h-3 fill-clickup-purple" />
          <span>Next.js 14 + OAuth 2.1 PKCE</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          Tu Pizarra Digital con <br /> Poder de ClickUp
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Un servidor MCP de alto rendimiento diseñado para conectar tus agentes de IA 
          con tus espacios de trabajo de ClickUp de forma segura y veloz.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <ClickUpAuthButton />
          <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Ver especificaciones MCP
          </button>
        </div>
      </div>

      {/* Grid de Características */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl w-full">
        <FeatureCard 
          icon={<ShieldCheck className="w-6 h-6 text-clickup-purple" />}
          title="OAuth 2.1 con PKCE"
          description="Estándares de seguridad de nivel bancario para la autorización de aplicaciones."
        />
        <FeatureCard 
          icon={<Database className="w-6 h-6 text-clickup-purple" />}
          title="Vercel Postgres"
          description="Persistencia de tokens cifrados con AES-256 para máxima confiabilidad."
        />
        <FeatureCard 
          icon={<LayoutPanelLeft className="w-6 h-6 text-clickup-purple" />}
          title="Herramientas MCP"
          description="Acceso completo a listado, obtención y creación de tareas vía IA."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-clickup-purple/30 transition-colors group">
      <div className="w-12 h-12 bg-clickup-purple/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
