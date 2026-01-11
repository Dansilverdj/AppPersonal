import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Linkedin, Mail, Smartphone,
  Terminal, Bot, Layout, CheckCircle2,
  GraduationCap, Sun, Moon, Code, Sparkles, Loader2, Lightbulb,
  ArrowRight, TrendingUp, Users, ShieldCheck, Quote
} from 'lucide-react';

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('dark');

  // --- ESTADOS PARA FUNCIONES IA ---
  const [aiLoading, setAiLoading] = useState({ draft: false, ideas: false });
  const [businessInput, setBusinessInput] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState(null);

  const canvasRef = useRef(null);
  // OPTIMIZACIÓN: Usamos useRef para la posición del mouse (evita re-renders masivos)
  const mousePosRef = useRef({ x: 0, y: 0 });

  // --- Estado y Manejadores del Formulario de Contacto ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // --- INTEGRACIÓN GEMINI API ---
  const callGemini = async (prompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_KEY || "";

    if (!apiKey) {
      console.warn("Falta la API Key de Gemini.");
    }

    try {
      // Usamos el modelo flash por ser rápido y estable
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar una respuesta. Verifica tu API Key.";
    } catch (error) {
      console.error("Error calling Gemini:", error);
      return "Hubo un error conectando con la IA. Por favor intenta de nuevo.";
    }
  };

  // Función 1: Generador de Ideas de Automatización
  const handleGenerateIdeas = async () => {
    if (!businessInput.trim()) return;
    setAiLoading(prev => ({ ...prev, ideas: true }));
    setGeneratedIdeas(null);

    const prompt = `Actúa como J Daniel Silvestre, consultor experto en QA y Administración. 
    El usuario tiene este tipo de negocio: "${businessInput}".
    Genera 3 ideas breves, innovadoras y rentables de automatización o tecnología para este negocio.
    Formato: Lista con viñetas cortas. Usa emojis. Tono: Profesional, enfocado en ahorro de dinero o tiempo.`;

    const result = await callGemini(prompt);
    setGeneratedIdeas(result);
    setAiLoading(prev => ({ ...prev, ideas: false }));
  };

  // Función 2: Magic Draft para Contacto
  const handleMagicDraft = async () => {
    if (!formData.message.trim()) return;
    setAiLoading(prev => ({ ...prev, draft: true }));

    const prompt = `Actúa como un asistente de redacción profesional.
    Toma este borrador informal de un cliente potencial: "${formData.message}"
    Reescríbelo para que sea un mensaje de contacto formal, claro y persuasivo dirigido a Daniel Silvestre (Consultor Tecnológico).
    Mantén la intención original pero mejora la gramática y el tono. Solo devuelve el texto del mensaje.`;

    const result = await callGemini(prompt);
    setFormData(prev => ({ ...prev, message: result }));
    setAiLoading(prev => ({ ...prev, draft: false }));
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const formspreeEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || "https://formspree.io/f/xldyyknb";

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitMessage('¡Mensaje enviado con éxito! Analizaré tu caso y te responderé pronto.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitMessage('Hubo un problema al enviar el mensaje. Por favor intenta contactarme por LinkedIn.');
      }
    } catch (error) {
      setSubmitMessage('Error de conexión. Por favor verifica tu internet.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // --------------------------------------------------

  // --- EFECTO DE FONDO INTERACTIVO (OPTIMIZADO CON USE REF) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const particleColor = theme === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(30, 64, 175, 0.7)';
    const lineColor = theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(107, 114, 128, 0.2)';
    const mouseLineColor = theme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.5)';

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = Math.min(window.innerWidth / 15, 100);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    const connectParticles = () => {
      // Leemos la posición del Ref (NO provoca re-render)
      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor.replace('0.15', `${0.15 - distance / 120 * 0.15}`);
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Conectar con el mouse
        const dxMouse = particles[i].x - mouseX;
        const dyMouse = particles[i].y - mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < 200) {
          ctx.beginPath();
          ctx.strokeStyle = mouseLineColor.replace('0.2', `${0.2 - distMouse / 200 * 0.2}`);
          ctx.lineWidth = 1.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }
    };

    window.addEventListener('resize', () => {
      resizeCanvas();
      init();
    });

    resizeCanvas();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); // NOTA: 'mousePos' eliminado de dependencias

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Actualizamos Ref (sin re-render)
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Detectar sección activa
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'cases', 'about', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const themeClasses = {
    dark: {
      bg: 'bg-slate-950 text-slate-200 selection:bg-indigo-500',
      navBg: 'bg-slate-950/80 border-slate-800/50',
      sectionBg1: 'bg-slate-900/80 border-slate-800',
      sectionBg2: 'bg-slate-950/80',
      cardBg: 'bg-slate-900/90 border-slate-800 hover:border-blue-500/50',
      text: 'text-slate-300',
      textMuted: 'text-slate-500',
      textHighlight: 'text-white',
      inputBg: 'bg-slate-800 border-slate-700 text-white placeholder-slate-500',
    },
    light: {
      bg: 'bg-slate-50 text-slate-800 selection:bg-indigo-600',
      navBg: 'bg-white/80 border-slate-200/50',
      sectionBg1: 'bg-slate-100/90 border-slate-200',
      sectionBg2: 'bg-slate-50/90',
      cardBg: 'bg-white/90 border-slate-200 hover:border-indigo-500/50',
      text: 'text-slate-600',
      textMuted: 'text-slate-500',
      textHighlight: 'text-slate-900',
      inputBg: 'bg-white border-slate-300 text-slate-800 placeholder-slate-400',
    }
  };

  const tc = themeClasses[theme];

  return (
    <div
      className={`min-h-screen font-sans relative ${tc.bg}`}
      onMouseMove={handleMouseMove}
    >
      {/* Estilos Animación Verde */}
      <style>{`
        @keyframes greenPulse {
          0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); border-color: rgba(74, 222, 128, 0.2); }
          50% { box-shadow: 0 0 20px 0 rgba(74, 222, 128, 0.4); border-color: rgba(74, 222, 128, 1); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); border-color: rgba(74, 222, 128, 0.2); }
        }
        .animate-green-pulse { animation: greenPulse 3s infinite ease-in-out; }
      `}</style>

      {/* CANVAS FONDO */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-60"
      />

      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b ${tc.navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                DS.
              </span>
            </div>

            <div className="flex items-center">
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {['Inicio', 'Servicios', 'Casos de Éxito', 'Filosofía', 'Contacto'].map((item, index) => {
                    const id = ['home', 'services', 'cases', 'about', 'contact'][index];
                    return (
                      <button
                        key={item}
                        onClick={() => scrollToSection(id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-indigo-500 ${activeSection === id ? 'text-indigo-500 scale-105' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')
                          }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className={`ml-4 p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-100'}`}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="md:hidden ml-2">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 rounded-md ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600'}`}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Inicio', 'Servicios', 'Casos de Éxito', 'Filosofía', 'Contacto'].map((item, index) => {
                const id = ['home', 'services', 'cases', 'about', 'contact'][index];
                return (
                  <button
                    key={item}
                    onClick={() => scrollToSection(id)}
                    className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200'}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION (VENTAS) --- */}
      <section id="home" className="relative z-10 pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className={`inline-flex items-center px-3 py-1 rounded-full border border-green-500/30 ${theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-500/20 text-green-700'} text-sm font-medium mb-6 backdrop-blur-sm animate-green-pulse`}>
              <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Consultoría Abierta para PYMES
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg leading-tight">
              Transformo Negocios con <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                Datos, Procesos e IA
              </span>
            </h1>
            <p className={`text-xl md:text-2xl ${tc.text} mb-8 max-w-2xl mx-auto md:mx-0 font-light`}>
              No solo desarrollo software. <span className={`${tc.textHighlight} font-semibold`}>Diseño rentabilidad.</span><br />
              Optimiza operaciones, reduce errores y escala tu empresa con estrategias tecnológicas a medida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => scrollToSection('contact')}
                className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-blue-500/50 z-20 flex items-center justify-center gap-2"
              >
                Solicitar Diagnóstico <ArrowRight size={20} />
              </button>
              <button
                onClick={() => scrollToSection('cases')}
                className={`px-8 py-3 rounded-lg border ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50 text-slate-300' : 'border-slate-300 bg-white/50 text-slate-700'} font-medium transition-all backdrop-blur-sm z-20`}
              >
                Ver Resultados
              </button>
            </div>
          </div>

          {/* GENERADOR DE ESTRATEGIAS (HOOK DE VENTA) */}
          <div className="flex-1 z-10 w-full">
            <div className={`p-8 rounded-2xl border bg-gradient-to-br ${theme === 'dark' ? 'from-slate-900 via-indigo-950/30 to-slate-900' : 'from-white via-indigo-50 to-white'} relative overflow-hidden shadow-2xl animate-green-pulse`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot size={100} />
              </div>

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold mb-4 border border-green-500/30">
                  <Sparkles size={12} className="animate-pulse" /> DEMO GRATUITA: CONSULTOR IA
                </div>
                <h3 className={`text-2xl font-bold ${tc.textHighlight} mb-3`}>
                  ¿Cómo puedes ahorrar dinero hoy?
                </h3>
                <p className={`text-sm mb-6 ${tc.text}`}>
                  Escribe tu giro de negocio (ej: Restaurante, Taller, Clínica) y obtén <strong>3 ideas inmediatas de automatización</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
                  <input
                    type="text"
                    value={businessInput}
                    onChange={(e) => setBusinessInput(e.target.value)}
                    placeholder="Ej: Gimnasio, Ferretería..."
                    className={`flex-1 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${tc.inputBg}`}
                  />
                  <button
                    onClick={handleGenerateIdeas}
                    disabled={aiLoading.ideas || !businessInput}
                    className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg flex items-center justify-center gap-2"
                  >
                    {aiLoading.ideas ? <Loader2 className="animate-spin" size={20} /> : <><Lightbulb size={20} /> Generar</>}
                  </button>
                </div>

                {generatedIdeas && (
                  <div className={`text-left p-6 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme === 'dark' ? 'bg-slate-950/80 border-indigo-500/50' : 'bg-white/80 border-indigo-200'} max-h-60 overflow-y-auto`}>
                    <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2 sticky top-0 bg-opacity-90 backdrop-blur-sm py-2">
                      <Bot size={18} /> Oportunidades Detectadas:
                    </h4>
                    <div className={`whitespace-pre-line text-sm leading-relaxed ${tc.text}`}>
                      {generatedIdeas}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section id="services" className="relative z-10 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${tc.textHighlight} mb-4`}>
              Soluciones Integrales
            </h2>
            <p className={`max-w-2xl mx-auto ${tc.text}`}>
              Combino la administración tradicional con tecnología de punta para crear sistemas que funcionan solos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Servicio 1 */}
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 shadow-lg`}>
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className={`text-xl font-bold ${tc.textHighlight} mb-3`}>Consultoría de Procesos & IA</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>
                Analizo tus flujos de trabajo actuales para eliminar cuellos de botella. Implemento Chatbots y Agentes IA que trabajan 24/7.
              </p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500" /> Reducción de Costos Operativos</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500" /> Atención al Cliente Automatizada</li>
              </ul>
            </div>

            {/* Servicio 2 */}
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 relative shadow-lg`}>
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">Especialidad</div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className={`text-xl font-bold ${tc.textHighlight} mb-3`}>Calidad de Software (QA)</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>
                ¿Ya tienes software pero falla? Audito y mejoro la calidad de tus sistemas para asegurar que no pierdas ventas por errores técnicos.
              </p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Pruebas Automatizadas</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Estabilidad Garantizada</li>
              </ul>
            </div>

            {/* Servicio 3 */}
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 shadow-lg`}>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                <Layout className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className={`text-xl font-bold ${tc.textHighlight} mb-3`}>Desarrollo Web Estratégico</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>
                No solo "hago páginas web". Construyo herramientas de venta y plataformas de gestión interna (Dashboards) para dueños de negocio.
              </p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Paneles de Control (Dashboards)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Integración con Pasarelas de Pago</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- SUCCESS STORIES / CASE STUDIES SECTION --- */}
      <section id="cases" className={`relative z-10 py-20 ${tc.sectionBg1}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className={`text-3xl font-bold ${tc.textHighlight} mb-4 flex items-center gap-3`}>
                <TrendingUp className="text-green-500" /> Casos de Éxito
              </h2>
              <p className={`max-w-2xl ${tc.text}`}>
                Resultados reales en empresas reales. Así es como transformamos problemas en ventajas competitivas.
              </p>
            </div>
            <div className="hidden md:block">
              <span className={`text-sm ${tc.textMuted}`}>Desliza para ver más &rarr;</span>
            </div>
          </div>

          {/* CONTENEDOR DEL CASO DE ESTUDIO (Diseño destacado para 1 solo caso por ahora) */}
          <div className={`rounded-3xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-2xl`}>
            <div className="grid lg:grid-cols-2">
              
              {/* Lado Izquierdo: Información */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    GIMNASIOS & FITNESS
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    AUTOMATIZACIÓN
                  </span>
                </div>

                <h3 className={`text-3xl font-bold mb-6 ${tc.textHighlight}`}>
                  Modernización Integral: <br/> "F1rstGym"
                </h3>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>El Reto</h4>
                    <p className={`${tc.text} leading-relaxed`}>
                      Gestión manual basada en papel y Excel. Fugas de dinero por accesos no controlados y alta carga administrativa para el dueño, impidiendo el crecimiento de sucursales.
                    </p>
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>La Solución</h4>
                    <p className={`${tc.text} leading-relaxed`}>
                      Desarrollo de <strong>"GymControl"</strong>: Una plataforma web personalizada conectada a lectores biométricos. Automatización de check-ins, recordatorios de pago por WhatsApp y panel financiero en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-b py-6 mb-8 border-slate-700/50">
                  <div>
                    <div className="text-2xl font-bold text-green-500">100%</div>
                    <div className="text-xs text-slate-500">Control de Accesos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">-15h</div>
                    <div className="text-xs text-slate-500">Admin Semanal</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">0%</div>
                    <div className="text-xs text-slate-500">Cartera Vencida</div>
                  </div>
                </div>

                {/* Testimonio pequeño (Opcional) */}
                <div className={`italic text-sm ${tc.textMuted} flex gap-3`}>
                  <Quote size={20} className="text-slate-600 flex-shrink-0" />
                  "El sistema se pagó solo en el primer mes al recuperar cuotas perdidas. Ahora tengo control total desde mi celular."
                </div>
              </div>

              {/* Lado Derecho: Visuales */}
              <div className={`relative h-64 lg:h-auto overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center group`}>
                {/* PLACEHOLDER DE IMAGEN:
                   Cuando tengas la captura real, cambia la etiqueta <img> de abajo.
                   Por ahora, uso un div con icono o una imagen de placeholder.
                */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-medium">Dashboard Administrativo & Control de Acceso</p>
                </div>
                
                {/* Reemplaza src con tu imagen real: src="/assets/gym-project.jpg" */}
                {/* Si no hay imagen, este div sirve de placeholder visual */}
                <div className="text-center p-10 opacity-50">
                   <Layout size={64} className="mx-auto mb-4 text-slate-400"/>
                   <p className="text-slate-500 font-mono text-sm">Captura del Sistema (Próximamente)</p>
                   {/* <img src="/tu-imagen-aqui.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Proyecto Gym" /> */}
                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className={`text-sm ${tc.textMuted}`}>¿Quieres ver más detalles técnicos o una demo?</p>
            <button onClick={() => scrollToSection('contact')} className="mt-2 text-indigo-500 hover:text-indigo-400 font-semibold text-sm underline underline-offset-4">
              Agenda una demostración
            </button>
          </div>
        </div>
      </section>

      {/* --- PHILOSOPHY / ABOUT SECTION --- */}
      <section id="about" className={`relative z-10 py-20 backdrop-blur-sm ${tc.sectionBg2}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className={`text-3xl font-bold ${tc.textHighlight} mb-6 flex items-center gap-3`}>
                <Terminal className="text-blue-500" />
                Mi Filosofía de Trabajo
              </h2>
              <div className={`space-y-4 leading-relaxed ${tc.text}`}>
                <p>
                  Muchos consultores te entregan un documento PDF y se van. Muchos programadores te entregan código y no entienden tu negocio.
                </p>
                <p>
                  Yo soy el punto medio. Como <strong className="text-indigo-500">Administrador de Empresas</strong>, entiendo de flujos de caja y ROI. Como <strong className="text-blue-500">QA Engineer</strong>, entiendo de sistemas robustos.
                </p>
                <p>
                  No busco venderte la tecnología de moda. Busco implementar la herramienta exacta que hará que tu negocio sea más fácil de dirigir y más rentable.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {/* Tech Stack simplificado para clientes */}
                {['Automatización', 'Dashboards', 'Bases de Datos', 'Inteligencia Artificial', 'Web Apps'].map((skill) => (
                   <span key={skill} className={`px-3 py-1 rounded-full text-xs font-medium border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
                     {skill}
                   </span>
                ))}
              </div>
            </div>

            <div>
              <div className={`p-8 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'}`}>
                <h3 className={`text-xl font-bold ${tc.textHighlight} mb-4`}>¿Por qué elegirme?</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="mt-1 bg-green-500/20 p-1 rounded text-green-500"><CheckCircle2 size={16}/></div>
                    <div>
                      <strong className={`${tc.textHighlight}`}>Visión de Dueño</strong>
                      <p className={`text-sm ${tc.textMuted}`}>Fui dueño de negocio (Lotería) por 6 años. Entiendo el estrés de la nómina y la operación.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 bg-blue-500/20 p-1 rounded text-blue-500"><Code size={16}/></div>
                    <div>
                      <strong className={`${tc.textHighlight}`}>Calidad Técnica</strong>
                      <p className={`text-sm ${tc.textMuted}`}>Experiencia corporativa probando software crítico. Nada de sistemas que se caen.</p>
                    </div>
                  </li>
                   <li className="flex gap-3">
                    <div className="mt-1 bg-purple-500/20 p-1 rounded text-purple-500"><Users size={16}/></div>
                    <div>
                      <strong className={`${tc.textHighlight}`}>Trato Directo</strong>
                      <p className={`text-sm ${tc.textMuted}`}>Sin intermediarios ni tecnicismos confusos. Hablamos de negocios.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION (FORM) --- */}
      <section id="contact" className={`relative z-10 py-20 ${tc.sectionBg1}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold ${tc.textHighlight} mb-6`}>Hablemos de tu Proyecto</h2>
          <p className={`mb-10 max-w-xl mx-auto ${tc.text}`}>
            La primera consulta de diagnóstico es gratuita. Cuéntame qué te duele hoy en tu negocio y veamos cómo solucionarlo.
          </p>

          <form onSubmit={handleSubmit} className={`p-8 rounded-xl border max-w-lg mx-auto text-left shadow-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>

            {/* Mensaje de estado */}
            {submitMessage && (
              <div className={`p-4 mb-4 text-sm rounded-lg ${submitMessage.includes('éxito') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'} ${submitMessage.includes('ATENCIÓN') ? 'bg-yellow-600/20 text-yellow-400' : ''}`}>
                {submitMessage}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="name" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Nombre / Empresa</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${tc.inputBg}`}
                placeholder="Tu nombre"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${tc.inputBg}`}
                placeholder="contacto@empresa.com"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>WhatsApp (Opcional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${tc.inputBg}`}
                placeholder="Para respuesta rápida"
              />
            </div>

            <div className="mb-6 relative">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="message" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  ¿En qué puedo ayudarte?
                </label>
                <button
                  type="button"
                  onClick={handleMagicDraft}
                  disabled={aiLoading.draft || !formData.message}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${theme === 'dark'
                    ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    } disabled:opacity-50`}
                  title="Escribe una idea rápida y la IA la redactará formalmente por ti"
                >
                  {aiLoading.draft ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                  {aiLoading.draft ? 'Redactando...' : 'Mejorar Texto con IA'}
                </button>
              </div>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleFormChange}
                required
                className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none ${tc.inputBg}`}
                placeholder="Ej: Tengo un gimnasio y pierdo mucho tiempo controlando quién pagó y quién no..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/30 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>

          <div className="mt-10 flex justify-center gap-6">
            <a href="https://www.linkedin.com/in/dansilver9" target="_blank" rel="noopener noreferrer"
              className={`transition-colors transform hover:scale-110 ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}>
              <Linkedin size={28} />
            </a>
            <a href="https://github.com/Dansilverdj" target="_blank" rel="noopener noreferrer"
              className={`transition-colors transform hover:scale-110 ${theme === 'dark' ? 'text-slate-400 hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'}`}>
              <Code size={28} />
            </a>
          </div>

          <div className={`mt-16 pt-8 border-t ${theme === 'dark' ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-500'} text-sm`}>
            <p>&copy; 2025 J Daniel Silvestre. Consultoría Estratégica & Desarrollo.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
