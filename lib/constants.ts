// Constantes y configuración de PCOptimize

export const SITE_CONFIG = {
  name: "PCOptimize",
  tagline: "Tu PC como nueva en 30 minutos",
  description: "Servicio profesional de optimización remota de computadoras. Limpieza, velocidad y seguridad garantizada.",
  contact: {
    email: "contacto@pcoptimize.com",
    whatsapp: "+1234567890",
    whatsappMessage: "Hola! Me interesa optimizar mi PC",
  },
  social: {
    twitter: "https://twitter.com/pcoptimize",
    instagram: "https://instagram.com/pcoptimize",
    youtube: "https://youtube.com/@pcoptimize",
  },
};

// Precios siempre en USD — no hay conversión a monedas locales.
// La región (latam/international) se detecta automáticamente por IP.

export const PRICING_PLANS = [
  {
    id: "basic",
    name: "Básico",
    duration: "30-45 min aprox.",
    description: "Limpieza esencial para trabajo y uso diario",
    features: [
      "Limpieza profunda del sistema",
      "Inicio más rápido de Windows",
      "Servicios innecesarios desactivados",
      "Plan de energía de máximo rendimiento",
      "Librerías para juegos instaladas",
      "Drivers actualizados",
      "Menos animaciones, más velocidad",
      "RAM y CPU optimizados desde BIOS*",
    ],
    popular: false,
    cta: "Elegir Básico",
  },
  {
    id: "gamer",
    name: "Gamer",
    duration: "1 - 1.5 horas aprox.",
    description: "Máximo rendimiento para gaming y streaming",
    features: [
      "Todo lo del plan Básico",
      "Mouse y teclado más precisos",
      "Menos input lag en juegos",
      "Más FPS y estables (NVIDIA optimizado)",
      "Menor ping y mejor conexión",
      "RAM limpia automáticamente",
      "Prioridad de recursos para juegos",
      "GPU con configuración avanzada",
      "Menos procesos de fondo",
      "USB y pantalla completa optimizados",
    ],
    popular: true,
    cta: "Elegir Gamer",
  },
] as const;

export const FEATURES = [
  {
    icon: "Zap",
    title: "Velocidad Extrema",
    description: "Tu PC arrancará y funcionará hasta 3x más rápido con nuestra optimización profesional.",
  },
  {
    icon: "Shield",
    title: "Seguridad Total",
    description: "Eliminamos virus, malware y protegemos tu equipo contra amenazas futuras.",
  },
  {
    icon: "Trash2",
    title: "Limpieza Profunda",
    description: "Liberamos espacio eliminando archivos innecesarios y basura del sistema.",
  },
  {
    icon: "Monitor",
    title: "100% Remoto",
    description: "No necesitas salir de casa. Nos conectamos de forma segura a tu PC.",
  },
  {
    icon: "Clock",
    title: "Rápido y Eficiente",
    description: "En menos de 2 horas tendrás tu computadora funcionando como nueva.",
  },
  {
    icon: "Lock",
    title: "Privacidad Garantizada",
    description: "Tus datos están seguros. Trabajamos con total transparencia y confidencialidad.",
  },
] as const;

export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Elige tu Plan",
    description: "Selecciona el plan que mejor se adapte a tus necesidades y realiza el pago seguro.",
    icon: "CreditCard",
  },
  {
    step: 2,
    title: "Agenda tu Cita",
    description: "Coordinamos por WhatsApp el mejor horario para realizar la optimización.",
    icon: "Calendar",
  },
  {
    step: 3,
    title: "Nos Conectamos",
    description: "Mediante una conexión remota segura, accedemos a tu PC para trabajar.",
    icon: "Wifi",
  },
  {
    step: 4,
    title: "PC Optimizada",
    description: "¡Listo! Tu computadora funcionará como nueva. Garantía de satisfacción.",
    icon: "CheckCircle",
  },
] as const;

export const TESTIMONIALS = [
  {
    id: 1,
    name: "María García",
    country: "Colombia",
    avatar: "MG",
    rating: 5,
    text: "Increíble servicio. Mi laptop que tardaba 5 minutos en encender, ahora arranca en 30 segundos. 100% recomendado.",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    country: "México",
    avatar: "CR",
    rating: 5,
    text: "Profesional y rápido. Pensé que tendría que comprar una PC nueva, pero después de la optimización funciona perfecta.",
  },
  {
    id: 3,
    name: "Ana Martínez",
    country: "España",
    avatar: "AM",
    rating: 5,
    text: "Muy buen trato y explicación de todo el proceso. Mi computadora vuela ahora. Excelente relación calidad-precio.",
  },
  {
    id: 4,
    name: "José Hernández",
    country: "Argentina",
    avatar: "JH",
    rating: 5,
    text: "Tenía miedo de dar acceso remoto, pero fue todo muy transparente. Pude ver todo lo que hacía. Súper confiable.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "¿Es seguro dar acceso remoto a mi computadora?",
    answer: "Absolutamente. Utilizamos software de conexión remota de nivel empresarial (como AnyDesk o TeamViewer) que es encriptado y seguro. Además, tú puedes ver todo lo que hacemos en tiempo real y desconectar cuando quieras.",
  },
  {
    question: "¿Cuánto tiempo toma la optimización?",
    answer: "El plan Básico toma entre 30-45 minutos, el Gamer entre 1-1.5 horas, y el Premium incluye el mismo tiempo más soporte continuo. Te mantenemos informado durante todo el proceso.",
  },
  {
    question: "¿Qué pasa si no quedo satisfecho con el servicio?",
    answer: "Ofrecemos garantía de satisfacción. Si no notas mejoras significativas en tu PC, te devolvemos el 100% de tu dinero sin preguntas.",
  },
  {
    question: "¿Funcionará con mi computadora vieja?",
    answer: "Sí, de hecho las computadoras más antiguas son las que más se benefician de una optimización. Hemos revivido PCs de más de 10 años de antigüedad.",
  },
  {
    question: "¿Necesito estar presente durante el proceso?",
    answer: "Preferiblemente sí, especialmente al inicio para autorizar la conexión. Sin embargo, puedes hacer otras cosas mientras trabajamos. Te avisaremos cuando terminemos.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos pagos a través de PayPal, que permite pagar con tarjetas de crédito, débito, saldo de PayPal y otros métodos locales. PayPal es una plataforma de pagos 100% segura utilizada por millones de personas en todo el mundo.",
  },
] as const;

export const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Proceso" },
  { href: "#precios", label: "Precios" },
  { href: "#sobre-mi", label: "Sobre Mí" },
  { href: "#faq", label: "FAQ" },
] as const;

export const STATS = [
  { value: "100+", label: "PCs Optimizadas" },
  { value: "4.9★", label: "Calificación" },
  { value: "30min", label: "Tiempo Promedio" },
] as const;
