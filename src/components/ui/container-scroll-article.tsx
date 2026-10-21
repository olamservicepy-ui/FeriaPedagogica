// src/components/ui/container-scroll-article.tsx
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContainerScrollProps {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  headerImage: string;
  className?: string;
}

export const AcademicContainerScroll = ({
  titleComponent,
  children,
  headerImage,
  className,
}: ContainerScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.95, 1] : [1.05, 1]);

  const rotate = useTransform(scrollYProgress, [0, 0.4], [12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.4], [0, -40]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center justify-center p-4 sm:p-10", className)}
    >
      <div className="w-full relative py-6 sm:py-12" style={{ perspective: "1000px" }}>
        {/* Encabezado con el Título y Metadatos */}
        <Header translate={translate} titleComponent={titleComponent} />

        {/* Tarjeta Aceternity con perspectiva 3D al hacer scroll */}
        <Card
          rotate={rotate}
          scale={scale}
          headerImage={headerImage}
        >
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-4xl mx-auto text-center mb-8 px-4"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  headerImage,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  headerImage: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 20px 50px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)",
      }}
      className="max-w-5xl mx-auto w-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl transition-shadow"
    >
      {/* 1. Hero Banner: Estudiante con rostro nítido y degradado institucional blanco */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-100">
        <img
          src={headerImage}
          alt="Investigador"
          className="w-full h-full object-cover object-top"
        />
        {/* Degradado retrasado: respeta la cabeza/ojos y se funde suavemente abajo */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent via-25% pointer-events-none" />
      </div>

      {/* 2. Cuerpo del Artículo */}
      <div className="relative -mt-12 bg-white px-6 sm:px-12 py-8 rounded-t-3xl border-t border-slate-100">
        {children}
      </div>
    </motion.div>
  );
};

export default AcademicContainerScroll;
