import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Bell, Handshake, Users, BarChart3, Package, ArrowRight } from 'lucide-react';

function FeatureItem({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-8 h-8 bg-primary border-2 border-black rounded flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </li>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl space-y-6 sm:space-y-8">
        {/* Hero */}
        <header className="text-center space-y-3">
          <div className="inline-block border-2 border-black bg-primary px-4 py-2 shadow-[4px_4px_0_0_#000]">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              Mundialín
            </h1>
          </div>
          <p className="text-base sm:text-lg max-w-xl mx-auto">
            <span className="font-semibold">Tu radar en los grupos de WhatsApp.</span>
            <br />
            <span className="text-muted-foreground">Monitoreamos el mercado de boletos del Mundial 2026 para que tú no tengas que hacerlo.</span>
          </p>
          {/* Stats inline */}
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">10+</span> grupos  ·
            <span className="font-semibold text-foreground">10,000+</span> ofertas confiables analizadas
          </p>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buyer Card */}
          <Card className="flex flex-col">
            <CardContent className="flex-1 flex flex-col gap-4 p-4 sm:p-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold">Quiero comprar boletos</h3>
                <p className="text-sm text-muted-foreground">
                  Te ayudamos a encontrar los partidos que buscas
                </p>
              </div>
              <ul className="space-y-3 flex-1">
                <FeatureItem
                  icon={TrendingDown}
                  title="Precios reales del mercado"
                  description="Conoce cuánto pagar, sin adivinar"
                />
                <FeatureItem
                  icon={Bell}
                  title="Alertas de oportunidad"
                  description="Te avisamos cuando baje de precio"
                />
                <FeatureItem
                  icon={Handshake}
                  title="Asesoría personalizada"
                  description="Te conseguimos boletos confiables"
                />
              </ul>
              <Button asChild size="lg" className="w-full group">
                <Link href="/signup">
                  Ver precios de partidos
                  <ArrowRight className="w-4 h-4 ml-1 group-active:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card className="flex flex-col">
            <CardContent className="flex-1 flex flex-col gap-4 p-4 sm:p-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold">Quiero vender boletos</h3>
                  <span className="text-xs font-bold bg-primary px-1.5 py-0.5 border border-black rounded">
                    PREMIUM
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vende más rápido sin vivir en los grupos
                </p>
              </div>
              <ul className="space-y-3 flex-1">
                <FeatureItem
                  icon={Users}
                  title="Compradores en tiempo real"
                  description="Te avisamos cuando busquen tus partidos"
                />
                <FeatureItem
                  icon={BarChart3}
                  title="Tu precio vs. el mercado"
                  description="Ajusta para vender más rápido"
                />
                <FeatureItem
                  icon={Package}
                  title="Gestión de inventario"
                  description="Todos tus boletos en un solo lugar"
                />
              </ul>
              <Button asChild size="lg" className="w-full group">
                <a href="https://wa.link/ufd191" target="_blank" rel="noopener noreferrer">
                  Quiero ser Premium
                  <ArrowRight className="w-4 h-4 ml-1 group-active:translate-x-0.5 transition-transform" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-foreground font-semibold underline underline-offset-4">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
