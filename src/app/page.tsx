import { Button } from "@/components/ui/button";
import { Microscope, QrCode, ClipboardList, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Hero Section */}
      <header className="bg-white border-b relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 animate-pulse">
            <Microscope size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl">
            Museo de Patología Virtual <br />
            <span className="text-blue-600">Facultad de Medicina</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl leading-relaxed">
            Una plataforma interactiva para estudiantes y docentes del Departamento de Patología.
            Escanea códigos QR en las muestras físicas para obtener detalles instantáneos.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/admin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                Acceso Admin
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 border-slate-300">
              Explorar Catálogo
            </Button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<QrCode className="text-blue-600" />}
              title="Acceso por QR"
              description="Cada muestra en el museo físico cuenta con un código QR único que enlaza a su ficha técnica completa."
            />
            <FeatureCard
              icon={<ClipboardList className="text-blue-600" />}
              title="Información Detallada"
              description="Accede a descripciones, hallazgos técnicos e imágenes de alta resolución de cada patología."
            />
            <FeatureCard
              icon={<GraduationCap className="text-blue-600" />}
              title="Recurso Educativo"
              description="Diseñado para facilitar el estudio autónomo y la revisión de casos clínicos complejos."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Microscope size={18} />
            </div>
            <span className="font-bold text-slate-800">Museo Pathos</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; 2026 Facultad de Medicina - Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
