// PCOptimize Constants and Configuration

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

export const CURRENCIES = {
  USD: { symbol: "$", rate: 1, name: "USD" },
  COP: { symbol: "$", rate: 4200, name: "COP" },
  EUR: { symbol: "€", rate: 0.92, name: "EUR" },
  MXN: { symbol: "$", rate: 17, name: "MXN" },
  ARS: { symbol: "$", rate: 900, name: "ARS" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const PRICING_PLANS = [
  {
    id: "basic",
    name: "Básico",
    priceUSD: 15,
    duration: "1 hora aprox.",
    description: "Limpieza esencial para mejorar el rendimiento",
    features: [
      "Limpieza de archivos temporales",
      "Optimización de inicio",
      "Análisis de malware básico",
      "Liberación de espacio en disco",
      "Soporte por chat incluido",
    ],
    popular: false,
    cta: "Elegir Básico",
  },
  {
    id: "premium",
    name: "Premium",
    priceUSD: 30,
    duration: "2 horas aprox.",
    description: "Servicio completo de optimización profesional",
    features: [
      "Todo lo del plan Básico",
      "Limpieza profunda del sistema",
      "Optimización de registro",
      "Eliminación completa de malware",
      "Actualización de drivers",
      "Configuración de privacidad",
      "Soporte prioritario 7 días",
    ],
    popular: true,
    cta: "Elegir Premium",
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
    answer: "El plan Básico toma aproximadamente 1 hora, mientras que el plan Premium puede tomar hasta 2 horas dependiendo del estado de tu PC. Te mantenemos informado durante todo el proceso.",
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
    answer: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) a través de Stripe, que es una plataforma de pagos 100% segura utilizada por empresas como Amazon y Google.",
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
