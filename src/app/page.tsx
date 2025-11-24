import { BarChart3, Building2, Car, DollarSign, Shield, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getLoginRoute } from '@/libs/EnvHelpers';

export default function Home() {
  const loginRoute = getLoginRoute();

  const features = [
    {
      icon: Car,
      title: 'Gerenciamento Inteligente',
      description:
        'Controle completo de entrada e saída de veículos com registro em tempo real',
    },
    {
      icon: Building2,
      title: 'Para Organizações',
      description:
        'Gerencie múltiplos estacionamentos, defina preços e monitore ocupação',
    },
    {
      icon: User,
      title: 'Para Motoristas',
      description:
        'Cadastre seus veículos, acompanhe histórico e gerencie suas sessões de estacionamento',
    },
    {
      icon: BarChart3,
      title: 'Relatórios Detalhados',
      description:
        'Acompanhe métricas, receitas e estatísticas de uso dos seus estacionamentos',
    },
    {
      icon: DollarSign,
      title: 'Tabela de Preços',
      description: 'Configure preços flexíveis por período e tipo de veículo',
    },
    {
      icon: Shield,
      title: 'Seguro e Confiável',
      description: 'Sistema seguro com autenticação e controle de acesso por perfil',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Cadastre-se',
      description: 'Crie sua conta como organização ou motorista',
    },
    {
      step: '2',
      title: 'Configure',
      description: 'Organizações configuram estacionamentos e preços',
    },
    {
      step: '3',
      title: 'Gerencie',
      description: 'Registre entradas e saídas de veículos em tempo real',
    },
    {
      step: '4',
      title: 'Acompanhe',
      description: 'Visualize relatórios e histórico completo de operações',
    },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-background overflow-x-hidden">
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/parking/modern-parking-garage-entrance.jpg"
            alt="Estacionamento moderno"
            fill
            className="object-cover opacity-20 dark:opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300"
              role="img"
              aria-label="Logo do ParkHub"
            >
              <Image
                src="/images/logo/parkhub-logo.svg"
                alt="ParkHub - Sistema de gerenciamento de estacionamentos"
                width={48}
                height={57}
                className="w-10 h-auto sm:w-12 sm:h-auto md:w-14 md:h-auto"
                priority
              />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              ParkHub
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto font-light">
              Soluções de estacionamento seguras para todos
            </p>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mt-4">
              Sistema completo de gerenciamento de estacionamentos que conecta
              organizações, empresas e clientes de forma inteligente e eficiente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Link href={loginRoute} aria-label="Entrar no sistema ParkHub">
                Começar Agora
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold"
            >
              <Link href="#sobre" aria-label="Saiba mais sobre o ParkHub">
                Saiba Mais
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Recursos Principais
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar estacionamentos de forma profissional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 group"
                >
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Simples, rápido e eficiente. Veja como começar em poucos passos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((item, index) => {
              return (
                <div key={index} className="relative text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-primary/30 transform translate-x-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="sobre"
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-card/50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Sobre o ParkHub
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                O ParkHub é uma plataforma completa desenvolvida para modernizar o
                gerenciamento de estacionamentos. Nossa solução conecta organizações que
                precisam gerenciar seus estacionamentos com motoristas que buscam uma
                experiência mais prática e organizada.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Com o ParkHub, você tem controle total sobre entradas e saídas,
                configuração de preços, geração de relatórios detalhados e muito mais.
                Tudo em uma interface intuitiva e moderna.
              </p>
              <div className="pt-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 text-base font-semibold shadow-lg"
                >
                  <Link href={loginRoute} aria-label="Acessar o sistema ParkHub">
                    Acessar Sistema
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/parking/covered-parking-lot-with-cars.jpg"
                alt="Estacionamento coberto"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Pronto para começar?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Junte-se ao ParkHub e transforme a forma como você gerencia estacionamentos
          </p>
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="h-14 text-lg font-semibold shadow-xl hover:shadow-2xl min-w-[240px]"
            >
              <Link href={loginRoute} aria-label="Criar conta no ParkHub">
                Começar Agora
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
