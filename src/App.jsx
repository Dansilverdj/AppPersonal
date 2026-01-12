import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Linkedin, Mail, Smartphone,
  Terminal, Bot, Layout, CheckCircle2,
  GraduationCap, Sun, Moon, Code, Sparkles, Loader2, Lightbulb,
  ArrowRight, TrendingUp, Users, ShieldCheck, Quote,
  Database, Server, Cpu, BarChart3, Lock
} from 'lucide-react';

// --- IMPORTACIÓN DE IMÁGENES ---
// Asegúrate de que las imágenes estén en la carpeta src/assets/
import financeImg from './assets/finance.png';
import posImg from './assets/pos.png';
import accessImg from './assets/access.png';

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('dark');

  // --- ESTADOS PARA FUNCIONES IA ---
  const [aiLoading, setAiLoading] = useState({ draft: false, ideas: false });
  const [businessInput, setBusinessInput] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState(null);

  const canvasRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  // --- Estado Formulario ---
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

  // --- INTEGRACIÓN GEMINI API (MODELO: 1.5 FLASH) ---
  const callGemini = async (prompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    
    if (!apiKey) {
      console.error("⛔ ERROR: Falta la API Key en el archivo .env");
      return "Error: Falta configuración de API Key.";
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Error de Google API:", data.error);
        return `Error IA: ${data.error.message}`;
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se generó respuesta.";
    } catch (error) {
      console.error("Error de conexión:", error);
      return "Error de conexión. Verifica tu internet.";
    }
  };

  // Función 1: Generador de Ideas
  const handleGenerateIdeas = async () => {
    if (!businessInput.trim()) return;
    setAiLoading(prev => ({ ...prev, ideas: true }));
    setGeneratedIdeas(null);

    const prompt = `Actúa como Daniel Silvestre, consultor experto en negocios y tecnología. 
    El usuario tiene este negocio: "${businessInput}".
    Genera 3 ideas breves, altamente rentables y tecnológicas (automatización/IA) para este negocio.
    Formato: Lista con emojis. Tono: Profesional, persuasivo y enfocado en ganancias.`;

    const result = await callGemini(prompt);
    setGeneratedIdeas(result);
    setAiLoading(prev => ({ ...prev, ideas: false }));
  };

  // Función 2: Magic Draft
  const handleMagicDraft = async () => {
    if (!formData.message.trim()) return;
    setAiLoading(prev => ({ ...prev, draft: true }));

    const prompt = `Reescribe este mensaje informal de un cliente potencial: "${formData.message}"
    para que sea una solicitud de consultoría formal, clara y directa dirigida a Daniel Silvestre.`;

    const result = await callGemini(prompt);
    setFormData(prev => ({ ...prev, message: result }));
    setAiLoading(prev => ({ ...prev, draft: false }));
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    const formspreeEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || "https://formspree.io/f/xldyyknb";

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setSubmitMessage('¡Mensaje enviado con éxito! Analizaré tu caso pronto.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitMessage('Error al enviar. Intenta por LinkedIn.');
      }
    } catch (error) {
      setSubmitMessage('Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EFECTO CANVAS ---
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
      particles.forEach(p => { p.update(); p.draw(); });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    const connectParticles = () => {
      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor.replace('0.15', `${0.15 - dist / 120 * 0.15}`);
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
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

    window.addEventListener('resize', () => { resizeCanvas(); init(); });
    resizeCanvas(); init(); animate();
    return () => { window.removeEventListener('resize', resizeCanvas); cancelAnimationFrame(animationFrameId); };
  }, [theme]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

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
    <div className={`min-h-screen font-sans relative ${tc.bg}`} onMouseMove={handleMouseMove}>
      <style>{`
        @keyframes greenPulse {
          0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); border-color: rgba(74, 222, 128, 0.2); }
          50% { box-shadow: 0 0 20px 0 rgba(74, 222, 128, 0.4); border-color: rgba(74, 222, 128, 1); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); border-color: rgba(74, 222, 128, 0.2); }
        }
        .animate-green-pulse { animation: greenPulse 3s infinite ease-in-out; }
      `}</style>

      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-60" />

      {/* --- NAV --- */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b ${tc.navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">DS.</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {['Inicio', 'Servicios', 'Casos de Éxito', 'Filosofía', 'Contacto'].map((item, index) => {
                  const id = ['home', 'services', 'cases', 'about', 'contact'][index];
                  return (
                    <button key={item} onClick={() => scrollToSection(id)} className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:text-indigo-500 ${activeSection === id ? 'text-indigo-500 scale-105' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}`}>
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-100'}`}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-md ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
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
                  <button key={item} onClick={() => scrollToSection(id)} className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200'}`}>
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO --- */}
      <section id="home" className="relative z-10 pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className={`inline-flex items-center px-3 py-1 rounded-full border border-green-500/30 ${theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-500/20 text-green-700'} text-sm font-medium mb-6 backdrop-blur-sm animate-green-pulse`}>
              <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Consultoría Abierta 2026
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg leading-tight">
              Transformo Negocios con <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                Datos, Procesos e IA
              </span>
            </h1>
            <p className={`text-xl md:text-2xl ${tc.text} mb-8 max-w-2xl mx-auto md:mx-0 font-light`}>
              No solo desarrollo aplicaciones. <span className={`${tc.textHighlight} font-semibold`}>Diseño rentabilidad.</span><br />
              Optimiza operaciones y reduce fugas de dinero con estrategias tecnológicas a medida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button onClick={() => scrollToSection('contact')} className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-blue-500/50 z-20 flex items-center justify-center gap-2">
                Solicitar Diagnóstico <ArrowRight size={20} />
              </button>
              <button onClick={() => scrollToSection('cases')} className={`px-8 py-3 rounded-lg border ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50 text-slate-300' : 'border-slate-300 bg-white/50 text-slate-700'} font-medium transition-all backdrop-blur-sm z-20`}>
                Ver Resultados
              </button>
            </div>
          </div>
          <div className="flex-1 z-10 w-full">
            <div className={`p-8 rounded-2xl border bg-gradient-to-br ${theme === 'dark' ? 'from-slate-900 via-indigo-950/30 to-slate-900' : 'from-white via-indigo-50 to-white'} relative overflow-hidden shadow-2xl animate-green-pulse`}>
              <div className="absolute top-0 right-0 p-4 opacity-10"><Bot size={100} /></div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold mb-4 border border-green-500/30">
                  <Sparkles size={12} className="animate-pulse" /> DEMO GRATUITA: CONSULTOR IA
                </div>
                <h3 className={`text-2xl font-bold ${tc.textHighlight} mb-3`}>¿Cómo puedes ahorrar dinero hoy?</h3>
                <p className={`text-sm mb-6 ${tc.text}`}>Escribe tu giro de negocio y obtén <strong>3 ideas inmediatas de automatización</strong>.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
                  <input type="text" value={businessInput} onChange={(e) => setBusinessInput(e.target.value)} placeholder="Ej: Gimnasio, Ferretería..." className={`flex-1 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${tc.inputBg}`} />
                  <button onClick={handleGenerateIdeas} disabled={aiLoading.ideas || !businessInput} className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg flex items-center justify-center gap-2">
                    {aiLoading.ideas ? <Loader2 className="animate-spin" size={20} /> : <><Lightbulb size={20} /> Generar</>}
                  </button>
                </div>
                {generatedIdeas && (
                  <div className={`text-left p-6 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme === 'dark' ? 'bg-slate-950/80 border-indigo-500/50' : 'bg-white/80 border-indigo-200'} max-h-60 overflow-y-auto`}>
                    <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2 sticky top-0 bg-opacity-90 backdrop-blur-sm py-2"><Bot size={18} /> Oportunidades:</h4>
                    <div className={`whitespace-pre-line text-sm leading-relaxed ${tc.text}`}>{generatedIdeas}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECH STACK --- */}
      <section className={`py-10 border-y ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={`text-sm font-semibold uppercase tracking-wider mb-6 ${tc.textMuted}`}>Tecnologías & Herramientas que Domino</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-80">
            {/* React */}
            <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><Code size={32} /></div>
              <span className={`text-xs font-medium ${tc.text}`}>React / Web</span>
            </div>
             {/* Python */}
             <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform"><Terminal size={32} /></div>
              <span className={`text-xs font-medium ${tc.text}`}>Python</span>
            </div>
             {/* SQL */}
             <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 rounded-lg bg-slate-500/10 text-slate-400 group-hover:scale-110 transition-transform"><Database size={32} /></div>
              <span className={`text-xs font-medium ${tc.text}`}>SQL / Datos</span>
            </div>
             {/* Automatización/Selenium */}
             <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform"><Bot size={32} /></div>
              <span className={`text-xs font-medium ${tc.text}`}>Selenium / IA</span>
            </div>
             {/* Análisis/SPSS */}
             <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform"><BarChart3 size={32} /></div>
              <span className={`text-xs font-medium ${tc.text}`}>SPSS / Analytics</span>
            </div>
             {/* Postman/API */}
             <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform"><Server size={32} /></div>
              <span className={`text-xs font-medium ${tc.text}`}>Postman / API</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES --- */}
      <section id="services" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${tc.textHighlight} mb-4`}>Soluciones Integrales</h2>
            <p className={`max-w-2xl mx-auto ${tc.text}`}>Combino la administración tradicional con tecnología de punta para crear sistemas que funcionan solos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 shadow-lg`}>
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6"><TrendingUp className="w-8 h-8 text-purple-400" /></div>
              <h3 className={`text-xl font-bold ${tc.textHighlight} mb-3`}>Consultoría de Procesos & IA</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>Analizo tus flujos de trabajo para eliminar cuellos de botella. Implemento Chatbots y Agentes IA que trabajan 24/7.</p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500" /> Reducción de Costos Operativos</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500" /> Automatización de Tareas</li>
              </ul>
            </div>
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 relative shadow-lg`}>
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">Especialidad</div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6"><ShieldCheck className="w-8 h-8 text-blue-400" /></div>
              <h3 className={`text-xl font-bold ${tc.textHighlight} mb-3`}>Calidad de Software (QA)</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>Audito y mejoro la calidad de tus sistemas. Me aseguro de que tu software no falle cuando más lo necesitas.</p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Pruebas Automatizadas (Selenium)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Estabilidad Garantizada</li>
              </ul>
            </div>
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 shadow-lg`}>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6"><Layout className="w-8 h-8 text-emerald-400" /></div>
              <h3 className={`text-xl font-bold ${tc.textHighlight} mb-3`}>Aplicaciones de Gestión</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>Desarrollo aplicaciones de escritorio y paneles de control (Dashboards) para dueños de negocio que necesitan control total.</p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Paneles Financieros</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Control de Inventarios & Accesos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- CASOS DE ÉXITO (CORREGIDO CON IMPORTACIONES) --- */}
      <section id="cases" className={`relative z-10 py-20 ${tc.sectionBg1}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className={`text-3xl font-bold ${tc.textHighlight} mb-4 flex items-center gap-3`}>
                <TrendingUp className="text-green-500" /> Caso de Éxito
              </h2>
              <p className={`max-w-2xl ${tc.text}`}>Resultados reales. Así es como transformamos problemas operativos en ventajas competitivas.</p>
            </div>
          </div>

          <div className={`rounded-3xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-2xl`}>
            <div className="grid lg:grid-cols-2">
              {/* Info */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">FITNESS & GYM</span>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">SOFTWARE A MEDIDA</span>
                </div>
                <h3 className={`text-3xl font-bold mb-6 ${tc.textHighlight}`}>Modernización Integral: <br/> "F1rstGym"</h3>
                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>El Reto</h4>
                    <p className={`${tc.text} leading-relaxed`}>Gestión manual, fugas de dinero por accesos no autorizados y falta de claridad financiera.</p>
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>La Solución: "GymControl"</h4>
                    <p className={`${tc.text} leading-relaxed`}>
                      Desarrollo de una <strong>Aplicación de Gestión Integral</strong>. Incluye control biométrico de acceso, punto de venta (POS) para tienda y dashboard financiero.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-b py-6 mb-8 border-slate-700/50">
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-bold text-green-500">100%</div>
                    <div className="text-xs text-slate-500">Control Accesos</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-bold text-blue-500">-15h</div>
                    <div className="text-xs text-slate-500">Admin Semanal</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-bold text-purple-500">ROI</div>
                    <div className="text-xs text-slate-500">Recuperado en 1 mes</div>
                  </div>
                </div>
              </div>

              {/* Grid de Imagenes del Sistema (USANDO VARIABLES IMPORTADAS) */}
              <div className={`p-4 md:p-8 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} flex flex-col gap-4 justify-center`}>
                 
                 {/* Imagen Principal (Finanzas) */}
                 <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative group aspect-video">
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">Dashboard Financiero</div>
                    <img src={financeImg} alt="Finanzas Dashboard" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {/* Imagen Secundaria 1 (POS/Tienda) */}
                    <div className="rounded-xl overflow-hidden shadow-lg border border-slate-700 relative group aspect-video">
                       <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">Punto de Venta</div>
                       <img src={posImg} alt="Tienda POS" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    {/* Imagen Secundaria 2 (Acceso) */}
                    <div className="rounded-xl overflow-hidden shadow-lg border border-slate-700 relative group aspect-video">
                       <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">Acceso Biométrico</div>
                       <img src={accessImg} alt="Control Acceso" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PHILOSOPHY --- */}
      <section id="about" className={`relative z-10 py-20 backdrop-blur-sm ${tc.sectionBg2}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className={`text-3xl font-bold ${tc.textHighlight} mb-6 flex items-center gap-3`}>
                <Terminal className="text-blue-500" /> Mi Filosofía
              </h2>
              <div className={`space-y-4 leading-relaxed ${tc.text}`}>
                <p>Muchos consultores entregan un PDF y se van. Muchos programadores entregan código y no entienden tu negocio.</p>
                <p>Yo soy el punto medio. Como <strong className="text-indigo-500">Administrador</strong>, entiendo de flujos de caja y ROI. Como <strong className="text-blue-500">QA Engineer</strong>, entiendo de sistemas robustos.</p>
                <p>No busco venderte la tecnología de moda. Busco implementar la herramienta exacta que hará que tu negocio sea más fácil de dirigir y más rentable.</p>
              </div>
            </div>
            <div>
              <div className={`p-8 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'}`}>
                <h3 className={`text-xl font-bold ${tc.textHighlight} mb-4`}>¿Por qué elegirme?</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="mt-1 bg-green-500/20 p-1 rounded text-green-500"><CheckCircle2 size={16}/></div>
                    <div><strong className={`${tc.textHighlight}`}>Visión de Dueño</strong><p className={`text-sm ${tc.textMuted}`}>Fui dueño de negocio por varios años. Entiendo el estrés de la nómina. Las ventas que no llegan.</p></div>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 bg-blue-500/20 p-1 rounded text-blue-500"><Code size={16}/></div>
                    <div><strong className={`${tc.textHighlight}`}>Calidad Técnica</strong><p className={`text-sm ${tc.textMuted}`}>Experiencia probando software crítico. Nada de sistemas que se caen. Automatizacion eficiente.</p></div>
                  </li>
                   <li className="flex gap-3">
                    <div className="mt-1 bg-purple-500/20 p-1 rounded text-purple-500"><Users size={16}/></div>
                    <div><strong className={`${tc.textHighlight}`}>Trato Directo</strong><p className={`text-sm ${tc.textMuted}`}>Sin intermediarios. Con honestidad. Hablamos de negocios.</p></div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT --- */}
      <section id="contact" className={`relative z-10 py-20 ${tc.sectionBg1}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold ${tc.textHighlight} mb-6`}>Hablemos de tu Proyecto</h2>
          <p className={`mb-10 max-w-xl mx-auto ${tc.text}`}>La primera consulta de diagnóstico es gratuita. Cuéntame qué te duele hoy en tu negocio.</p>
          <form onSubmit={handleSubmit} className={`p-8 rounded-xl border max-w-lg mx-auto text-left shadow-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
            {submitMessage && (
              <div className={`p-4 mb-4 text-sm rounded-lg ${submitMessage.includes('éxito') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                {submitMessage}
              </div>
            )}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Nombre / Empresa</label>
              <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className={`w-full p-3 rounded-lg focus:ring-blue-500 ${tc.inputBg}`} placeholder="Tu nombre" />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Correo</label>
              <input type="email" name="email" value={formData.email} onChange={handleFormChange} required className={`w-full p-3 rounded-lg focus:ring-blue-500 ${tc.inputBg}`} placeholder="contacto@empresa.com" />
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>WhatsApp</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className={`w-full p-3 rounded-lg focus:ring-blue-500 ${tc.inputBg}`} placeholder="Para respuesta rápida" />
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>¿En qué puedo ayudarte?</label>
                <button type="button" onClick={handleMagicDraft} disabled={aiLoading.draft || !formData.message} className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                  {aiLoading.draft ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                  {aiLoading.draft ? 'Redactando...' : 'Mejorar con IA'}
                </button>
              </div>
              <textarea name="message" rows="4" value={formData.message} onChange={handleFormChange} required className={`w-full p-3 rounded-lg focus:ring-blue-500 resize-none ${tc.inputBg}`} placeholder="Ej: Necesito controlar mi inventario..." />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg disabled:bg-indigo-400">
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
          <div className="mt-10 flex justify-center gap-6">
            <a href="https://www.linkedin.com/in/dansilver9" target="_blank" rel="noopener noreferrer" className={`transform hover:scale-110 ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}><Linkedin size={28} /></a>
            <a href="https://github.com/Dansilverdj" target="_blank" rel="noopener noreferrer" className={`transform hover:scale-110 ${theme === 'dark' ? 'text-slate-400 hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'}`}><Code size={28} /></a>
          </div>
          <div className={`mt-16 pt-8 border-t ${theme === 'dark' ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-500'} text-sm`}>
            <p>&copy; 2025 J Daniel Silvestre. Consultoría Estratégica.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
