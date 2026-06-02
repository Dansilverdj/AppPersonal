import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Linkedin, Mail, Smartphone,
  Terminal, Bot, Layout, CheckCircle2,
  GraduationCap, Sun, Moon, Code, Sparkles, Loader2, Lightbulb,
  ArrowRight, TrendingUp, Users, ShieldCheck, Quote,
  Database, Server, Cpu, BarChart3, Lock, MapPin
} from 'lucide-react';

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('dark');

  // --- ESTADOS PARA CALCULADORA DE AHORROS ---
  const [employees, setEmployees] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyCost, setHourlyCost] = useState(15);

  // --- ESTADOS PARA FUNCIONES IA ---
  const [aiLoading, setAiLoading] = useState({ draft: false, ideas: false });
  const [businessInput, setBusinessInput] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState(null);

  const canvasRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  // --- Estado Formulario ---
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    challenge: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // --- INTEGRACIÓN GEMINI API ---
  const callGemini = async (prompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    
    if (!apiKey) {
      console.warn("Falta API Key, activando modo simulación.");
      return simulateResponse(prompt);
    }

    const modelsToTry = [
      "gemini-2.5-flash",    
      "gemini-2.0-flash",    
      "gemini-flash-latest"  
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`Intentando conectar con modelo: ${model}...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );
        
        const data = await response.json();

        if (!data.error && data.candidates && data.candidates.length > 0) {
          return data.candidates[0].content.parts[0].text;
        }

        console.warn(`El modelo ${model} falló o no está disponible. Probando siguiente...`);
        
      } catch (error) {
        console.warn(`Error de red con ${model}. Probando siguiente...`);
      }
    }

    console.error("Todos los modelos fallaron. Usando respuesta simulada.");
    return simulateResponse(prompt);
  };

  const simulateResponse = (prompt) => {
    if (prompt.includes("ideas") || prompt.includes("Consultor")) {
      return `🚀 Estrategia de Ahorro Generada:\n\n1. 🤖 Chatbot de WhatsApp para Clientes: Responde dudas frecuentes y cotiza de forma automática las 24 horas. Ahorra unas 6 horas semanales por persona.\n2. 📊 Sincronización Automática de Inventario: Sistema en la nube que avisa cuando el stock es bajo y genera la lista de compras. Evita paros de venta.\n3. 📱 Comandero Digital (ChillDrinks POS): Registro e impresión instantánea de pedidos desde tablets a la barra y cocina. Reduce errores de comanda en un 95%.`;
    } else {
      return `Estimado equipo de DS Consulting,\n\nMe pongo en contacto para solicitar una sesión de diagnóstico gratuita de 15 minutos. El mayor cuello de botella en nuestra operación es la demora en responder mensajes y la gestión de tareas administrativas manuales.\n\nQuedo a la espera de sus comentarios para agendar.\n\nAtentamente,\n[Tu Nombre]`;
    }
  };

  const handleGenerateIdeas = async () => {
    if (!businessInput.trim()) return;
    setAiLoading(prev => ({ ...prev, ideas: true }));
    setGeneratedIdeas(null);

    const monthlyHoursLost = Math.round(employees * hoursPerWeek * 4.33);
    const monthlyCostLost = Math.round(monthlyHoursLost * hourlyCost);
    const monthlyHoursSaved = Math.round(monthlyHoursLost * 0.7);
    const monthlyMoneySaved = Math.round(monthlyCostLost * 0.7);

    const prompt = `Actúa como un Consultor de Negocios e IA experto de DS Consulting. El negocio es un/a "${businessInput}". Perdieron ${monthlyHoursLost} horas al mes en tareas manuales con un coste de $${monthlyCostLost} MXN. Dame exactamente 3 ideas rentables y prácticas de automatización/IA para recuperar esas ${monthlyHoursSaved} horas y ahorrar $${monthlyMoneySaved} MXN mensuales. Evita lenguaje técnico. Usa formato de lista corta con emojis.`;

    const result = await callGemini(prompt);
    setGeneratedIdeas(result);
    setAiLoading(prev => ({ ...prev, ideas: false }));
  };

  const handleMagicDraft = async () => {
    if (!formData.challenge.trim()) return;
    setAiLoading(prev => ({ ...prev, draft: true }));

    const prompt = `Reescribe formal y profesionalmente para el equipo de DS Consulting: "${formData.challenge}"`;

    const result = await callGemini(prompt);
    setFormData(prev => ({ ...prev, challenge: result }));
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
        setSubmitMessage('¡Diagnóstico solicitado con éxito! Analizaremos tu caso pronto.');
        setFormData({ name: '', contact: '', challenge: '' });
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

  const monthlyHoursLost = Math.round(employees * hoursPerWeek * 4.33);
  const monthlyCostLost = Math.round(monthlyHoursLost * hourlyCost);
  const monthlyHoursSaved = Math.round(monthlyHoursLost * 0.7);
  const monthlyMoneySaved = Math.round(monthlyCostLost * 0.7);

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
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">DS Consulting</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {['Inicio', 'El Problema', 'Soluciones', 'Casos de Éxito', 'Contacto'].map((item, index) => {
                  const id = ['home', 'problem', 'services', 'cases', 'contact'][index];
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
              {['Inicio', 'El Problema', 'Soluciones', 'Casos de Éxito', 'Contacto'].map((item, index) => {
                const id = ['home', 'problem', 'services', 'cases', 'contact'][index];
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

      {/* --- HERO & CALCULADORA --- */}
      <section id="home" className="relative z-10 pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className={`inline-flex items-center px-3 py-1 rounded-full border border-indigo-500/30 ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-500/20 text-indigo-700'} text-sm font-medium mb-6 backdrop-blur-sm`}>
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
              Soluciones Prácticas para tu Negocio
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg leading-tight">
              Libera tiempo, reduce costos y <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                multiplica tus ventas
              </span>
            </h1>
            <p className={`text-xl md:text-2xl ${tc.text} mb-8 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed`}>
              Diseñamos e implementamos soluciones prácticas y automatizaciones adaptadas a tu operación diaria. Sin complicaciones, sin códigos difíciles y 100% enfocado en tus resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="https://wa.me/524442227225?text=Hola%20DS%20Consulting%2C%20quiero%20agendar%20un%20diagn%C3%B3stico%20para%20mi%20negocio." target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-lg hover:shadow-green-500/50 z-20 flex items-center justify-center gap-2">
                <Smartphone size={20} /> Escríbenos por WhatsApp
              </a>
              <button onClick={() => scrollToSection('calculator')} className={`px-8 py-3 rounded-lg border ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50 text-slate-300' : 'border-slate-300 bg-white/50 text-slate-700'} font-medium transition-all backdrop-blur-sm z-20`}>
                Calcular Ahorro Operativo
              </button>
            </div>
          </div>

          {/* CALCULADORA INTERACTIVA / LEAD MAGNET */}
          <div id="calculator" className="flex-1 z-10 w-full lg:max-w-md mx-auto scroll-mt-24">
            <div className={`p-5 rounded-xl border bg-gradient-to-br ${theme === 'dark' ? 'from-slate-900 via-indigo-950/20 to-slate-900' : 'from-white via-indigo-50/30 to-white'} relative overflow-hidden shadow-2xl animate-green-pulse`}>
              <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={64} className="text-indigo-500" /></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold mb-3 border border-green-500/30">
                  <Sparkles size={10} className="animate-pulse" /> CALCULADORA DE AHORRO
                </div>
                <h3 className={`text-lg font-bold ${tc.textHighlight} mb-0.5`}>¿Cuánto pierdes por no automatizar?</h3>
                <p className={`text-[11px] mb-4 ${tc.text}`}>Mueve los controles para ver tu costo operativo estimado:</p>
                
                {/* Controles de la Calculadora */}
                <div className="space-y-3.5 mb-4 text-left">
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-0.5">
                      <span className={tc.text}>Colaboradores en tareas repetitivas:</span>
                      <span className="font-bold text-indigo-400">{employees} personas</span>
                    </div>
                    <input type="range" min="1" max="20" value={employees} onChange={(e) => setEmployees(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-0.5">
                      <span className={tc.text}>Horas manuales por semana por persona:</span>
                      <span className="font-bold text-indigo-400">{hoursPerWeek} horas</span>
                    </div>
                    <input type="range" min="1" max="40" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-0.5">
                      <span className={tc.text}>Costo estimado por hora operativa (MXN):</span>
                      <span className="font-bold text-indigo-400">${hourlyCost} MXN</span>
                    </div>
                    <input type="range" min="5" max="100" value={hourlyCost} onChange={(e) => setHourlyCost(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </div>

                {/* Resultados */}
                <div className="grid grid-cols-2 gap-2 border-t border-b py-2.5 my-3 border-slate-700/30">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${tc.textHighlight}`}>{monthlyHoursLost} hrs</div>
                    <div className="text-[10px] text-slate-500">Perdidas al mes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">${monthlyCostLost} MXN</div>
                    <div className="text-[10px] text-slate-500">Costo de ineficiencia</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-0.5">📈 Ahorro Potencial Estimado</div>
                  <div className="text-xl font-black text-green-400">${monthlyMoneySaved} MXN / mes</div>
                  <div className="text-[10px] text-slate-400">y {monthlyHoursSaved} horas recuperadas al mes</div>
                </div>

                {/* Generador de Ideas con Gemini */}
                <div className="border-t border-slate-700/30 pt-3">
                  <p className={`text-[11px] mb-2.5 ${tc.text} font-semibold`}>¿Quieres un plan rápido? Escribe tu giro de negocio:</p>
                  <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                    <input type="text" value={businessInput} onChange={(e) => setBusinessInput(e.target.value)} placeholder="Ej: Restaurante, Ferretería, Dental..." className={`flex-1 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all ${tc.inputBg}`} />
                    <button onClick={handleGenerateIdeas} disabled={aiLoading.ideas || !businessInput} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-1.5">
                      {aiLoading.ideas ? <Loader2 className="animate-spin" size={14} /> : <><Lightbulb size={14} /> Ver Plan</>}
                    </button>
                  </div>
                  {generatedIdeas && (
                    <div className={`text-left mt-3 p-4 rounded-lg border animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme === 'dark' ? 'bg-slate-950/80 border-indigo-500/50' : 'bg-white/80 border-indigo-200'} max-h-48 overflow-y-auto`}>
                      <h4 className="text-indigo-400 text-[10px] font-bold mb-1.5 flex items-center gap-1 sticky top-0 bg-opacity-95 backdrop-blur-sm"><Bot size={12} /> Soluciones para {businessInput}:</h4>
                      <div className={`whitespace-pre-line text-[11px] leading-relaxed ${tc.text}`}>{generatedIdeas}</div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- EL PROBLEMA / AGITACIÓN (Fórmula PAS) --- */}
      <section id="problem" className={`py-20 scroll-mt-16 border-y ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100 border-slate-200'} relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">¿El día no te alcanza?</span>
            <h2 className={`text-3xl md:text-4xl font-bold ${tc.textHighlight} mt-2 mb-4`}>Los dolores ocultos que frenan tu negocio</h2>
            <p className={`max-w-2xl mx-auto ${tc.text} font-light`}>Identifica los problemas diarios que consumen tus recursos y evitan que te enfoques en escalar ventas.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={`p-6 rounded-xl border ${tc.cardBg} transition-all`}>
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center mb-4"><Smartphone size={20} /></div>
              <h3 className={`text-base font-bold ${tc.textHighlight} mb-2`}>1. Responder tarde a los clientes</h3>
              <p className={`text-xs ${tc.text} leading-relaxed`}>Pierdes ventas valiosas porque las consultas de WhatsApp o redes se quedan sin responder por horas.</p>
            </div>
            <div className={`p-6 rounded-xl border ${tc.cardBg} transition-all`}>
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center mb-4"><Cpu size={20} /></div>
              <h3 className={`text-base font-bold ${tc.textHighlight} mb-2`}>2. Tareas manuales lentas</h3>
              <p className={`text-xs ${tc.text} leading-relaxed`}>Tu equipo pasa horas copiando datos, elaborando cotizaciones o registrando facturas en lugar de vender.</p>
            </div>
            <div className={`p-6 rounded-xl border ${tc.cardBg} transition-all`}>
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center mb-4"><Database size={20} /></div>
              <h3 className={`text-base font-bold ${tc.textHighlight} mb-2`}>3. Incertidumbre y fugas de stock</h3>
              <p className={`text-xs ${tc.text} leading-relaxed`}>Falta de claridad en las finanzas del día a día e inventarios que no cuadran sin contar manualmente.</p>
            </div>
            <div className={`p-6 rounded-xl border ${tc.cardBg} transition-all`}>
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center mb-4"><Lock size={20} /></div>
              <h3 className={`text-base font-bold ${tc.textHighlight} mb-2`}>4. Temor a quedarse obsoletos</h3>
              <p className={`text-xs ${tc.text} leading-relaxed`}>Sabes que tu competencia se está modernizando, pero no tienes el tiempo ni el equipo técnico para ponerte al día.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className={`text-base font-medium ${tc.textHighlight} max-w-3xl mx-auto`}>
              No necesitas ser un experto técnico. Nosotros asumimos toda la complejidad tecnológica para que tú te dediques a dirigir y hacer crecer tu negocio.
            </p>
          </div>
        </div>
      </section>

      {/* --- TECH STACK --- */}
      <section className={`py-10 border-b ${theme === 'dark' ? 'bg-slate-950/20 border-slate-900' : 'bg-slate-50 border-slate-200'} relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-6 ${tc.textMuted}`}>Tecnologías y herramientas prácticas que implementamos</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-80">
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><Code size={24} /></div>
              <span className={`text-[10px] font-medium ${tc.text}`}>React / Web</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform"><Terminal size={24} /></div>
              <span className={`text-[10px] font-medium ${tc.text}`}>Python</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="p-2.5 rounded-lg bg-slate-500/10 text-slate-400 group-hover:scale-110 transition-transform"><Database size={24} /></div>
              <span className={`text-[10px] font-medium ${tc.text}`}>SQL / Datos</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform"><Bot size={24} /></div>
              <span className={`text-[10px] font-medium ${tc.text}`}>Automatización</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
              <span className={`text-[10px] font-medium ${tc.text}`}>Dashboards</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform"><Server size={24} /></div>
              <span className={`text-[10px] font-medium ${tc.text}`}>Integración API</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES (Soluciones de Negocio) --- */}
      <section id="services" className="relative z-10 py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">¿Qué hacemos por ti?</span>
            <h2 className={`text-3xl md:text-4xl font-bold ${tc.textHighlight} mt-2 mb-4`}>Soluciones de negocio diseñadas para darte tranquilidad</h2>
            <p className={`max-w-2xl mx-auto ${tc.text} font-light`}>Transformamos software y herramientas avanzadas en beneficios claros para la rentabilidad de tu PyME.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 hover:-translate-y-1.5 shadow-lg`}>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6"><TrendingUp className="w-6 h-6 text-purple-400" /></div>
              <h3 className={`text-lg font-bold ${tc.textHighlight} mb-3`}>Atención al Cliente y Procesos Activos 24/7</h3>
              <p className={`text-xs mb-6 leading-relaxed ${tc.text}`}>Implementamos asistentes automatizados por WhatsApp y flujos internos que responden dudas, agendan y procesan información sin intervención humana.</p>
              <ul className="text-xs text-slate-500 space-y-2.5">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-purple-500" /> Reducción inmediata de costos de atención</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-purple-500" /> WhatsApp respondiendo en menos de 1 minuto</li>
              </ul>
            </div>
            
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 hover:-translate-y-1.5 shadow-lg`}>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6"><Layout className="w-6 h-6 text-blue-400" /></div>
              <h3 className={`text-lg font-bold ${tc.textHighlight} mb-3`}>Sistemas Simples para Controlar tu Operación</h3>
              <p className={`text-xs mb-6 leading-relaxed ${tc.text}`}>Desarrollamos herramientas a la medida (comanderos digitales, puntos de venta y apps) enfocadas al 100% en que recuperes la visibilidad y el control de tu stock y ventas.</p>
              <ul className="text-xs text-slate-500 space-y-2.5">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-500" /> Tableros financieros intuitivos en tu móvil</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-500" /> Apps que eliminan el uso de papel en tu local</li>
              </ul>
            </div>

            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 hover:-translate-y-1.5 shadow-lg`}>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6"><Bot className="w-6 h-6 text-emerald-400" /></div>
              <h3 className={`text-lg font-bold ${tc.textHighlight} mb-3`}>Tu Guía Estratégica en el Mundo Digital</h3>
              <p className={`text-xs mb-6 leading-relaxed ${tc.text}`}>Analizamos cómo opera tu empresa hoy, identificamos las ineficiencias más graves y te estructuramos un plan tecnológico claro, sin complicaciones ni palabras raras.</p>
              <ul className="text-xs text-slate-500 space-y-2.5">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Diagnóstico operativo sin costo</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Acompañamiento y capacitación a tu equipo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- CASOS DE ÉXITO --- */}
      <section id="cases" className={`relative z-10 py-20 scroll-mt-16 ${tc.sectionBg1}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Prueba de Resultados</span>
              <h2 className={`text-3xl font-bold ${tc.textHighlight} mt-2 mb-4 flex items-center gap-3`}>
                <TrendingUp className="text-green-500" /> Casos de Éxito Reales
              </h2>
              <p className={`max-w-2xl ${tc.text} font-light`}>Así es como ayudamos a negocios de la vida real a solucionar dolores operativos cotidianos.</p>
            </div>
          </div>

          <div className="space-y-12">
            {/* --- CASO 1: GYMCONTROL --- */}
            <div className={`rounded-3xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-2xl`}>
              <div className="grid lg:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">GYM & SERVICIOS</span>
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">OPCIÓN PERSONALIZADA</span>
                  </div>
                  <h3 className={`text-3xl font-bold mb-6 ${tc.textHighlight}`}>Control de accesos y caja: F1rstGym</h3>
                  
                  <div className="space-y-5 mb-8">
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 text-slate-500`}>El Reto</h4>
                      <p className={`${tc.text} text-sm leading-relaxed`}>El gimnasio sufría fugas de dinero por accesos de personas no registradas y el dueño gastaba más de 15 horas a la semana conciliando pagos y asistencias a mano.</p>
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 text-slate-500`}>La Solución</h4>
                      <p className={`${tc.text} text-sm leading-relaxed`}>
                        Diseñamos **GymControl**, una opción totalmente personalizada adaptada a los requerimientos específicos del cliente. Vinculamos lectores biométricos en la entrada con un punto de venta en recepción y un tablero financiero básico para un control absoluto.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-b py-5 mb-8 border-slate-700/30">
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-green-500">100%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Cero accesos libres</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-blue-500">-15 hrs</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">De papeleo semanal</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-purple-500">ROI</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Recuperado en 1 mes</div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 md:p-8 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} flex flex-col gap-4 justify-center`}>
                  <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative group aspect-video">
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm z-10 font-bold">Control de Acceso y Caja</div>
                    <img src="/finance.png" alt="Control de Caja Gym" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* --- CASO 2: COMANDERO DIGITAL (NUEVO) --- */}
            <div className={`rounded-3xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-2xl`}>
              <div className="grid lg:grid-cols-2">
                <div className={`p-4 md:p-8 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} flex flex-col gap-4 justify-center order-2 lg:order-1`}>
                  <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative group aspect-video">
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm z-10 font-bold">ChillDrinks POS en Pantalla y Tablet</div>
                    <img src="/pos.png" alt="ChillDrinks POS" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center order-1 lg:order-2">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">RESTAURANTES, BAR & CAFÉS</span>
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">OPCIÓN PERSONALIZADA</span>
                  </div>
                  <h3 className={`text-3xl font-bold mb-6 ${tc.textHighlight}`}>Control total de mesas y caja: ChillDrinks</h3>
                  
                  <div className="space-y-5 mb-8">
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 text-slate-500`}>El Reto</h4>
                      <p className={`${tc.text} text-sm leading-relaxed`}>El dueño escribía todos los pedidos sobre un bloc de notas de papel, lo que provocaba que se perdiera el control de su negocio, el inventario de bebidas y las ventas diarias.</p>
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 text-slate-500`}>La Solución</h4>
                      <p className={`${tc.text} text-sm leading-relaxed`}>
                        Implementamos **ChillDrinks POS**, un sistema adaptado a los requerimientos exactos del cliente como una opción personalizada. El mesero registra pedidos directamente desde una tablet, calculando la orden al instante, sincronizando stock en tiempo real y cobrando en segundos con un botón.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-b py-5 mb-8 border-slate-700/30">
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-emerald-500">40%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Servicio más rápido</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-red-500">-95%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Errores de comanda</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-indigo-500">100%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Cuentas cuadradas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- CASO 3: LOGYDISA --- */}
            <div className={`rounded-3xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-2xl`}>
              <div className="grid lg:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">LOGÍSTICA & TRANSPORTE</span>
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">OPCIÓN PERSONALIZADA</span>
                  </div>
                  <h3 className={`text-3xl font-bold mb-6 ${tc.textHighlight}`}>Identidad y presencia corporativa: LOGYDISA</h3>
                  
                  <div className="space-y-5 mb-8">
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 text-slate-500`}>El Reto</h4>
                      <p className={`${tc.text} text-sm leading-relaxed`}>La empresa de transporte operaba con un logotipo antiguo e inconsistente en sus camiones, facturas y sitio web, restando credibilidad comercial al competir por contratos importantes con grandes corporativos.</p>
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 text-slate-500`}>La Solución</h4>
                      <p className={`${tc.text} text-sm leading-relaxed`}>
                        Rediseñamos la marca por completo y creamos un manual de identidad integral como una opción personalizada y adaptada a sus requerimientos de negocio, abarcando rotulación vehicular para sus camiones, papelería digital y consistencia web.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-b py-5 mb-8 border-slate-700/30">
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-purple-500">360°</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Estandarización visual</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-slate-500">100%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Uso coherente</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold text-blue-500">+ Valor</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Credibilidad B2B</div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 md:p-8 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} flex flex-col gap-4 justify-center`}>
                  <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative group aspect-video">
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm z-10 font-bold">Manual y Uniformidad Visual</div>
                    <img src="/brand-main.png" alt="Identidad Corporativa" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- EL ENFOQUE (Filosofía) --- */}
      <section id="about" className={`relative z-10 py-20 backdrop-blur-sm ${tc.sectionBg2}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">¿Por qué DS Consulting?</span>
              <h2 className={`text-3xl font-bold ${tc.textHighlight} mt-2 mb-6 flex items-center gap-3`}>
                <Terminal className="text-blue-500" /> Nuestro Enfoque Realista
              </h2>
              <div className={`space-y-4 text-sm leading-relaxed ${tc.text}`}>
                <p><strong>La tecnología debe solucionar problemas cotidianos, no dar dolores de cabeza.</strong></p>
                <p>Nuestra perspectiva combina el rigor técnico del software con la realidad de tu presupuesto. Entendemos que lo único valioso es que cada desarrollo cuide tu flujo de caja, ahorre tiempo y funcione sin fallas operativas cotidianas.</p>
                <p>No te vendemos sistemas costosos o de moda que no necesitas. Analizamos tu local, gimnasio, consultorio u oficina y construimos la herramienta exacta para simplificarte la vida.</p>
              </div>
            </div>
            <div>
              <div className={`p-8 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'}`}>
                <h3 className={`text-lg font-bold ${tc.textHighlight} mb-4`}>¿Qué nos diferencia?</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="mt-1 bg-green-500/20 p-1 rounded text-green-500"><CheckCircle2 size={14}/></div>
                    <div><strong className={`text-sm ${tc.textHighlight}`}>Visión Comercial Clara</strong><p className={`text-xs ${tc.textMuted} mt-0.5`}>Todo proyecto debe tener un retorno de inversión inmediato. Te ayudamos a cuidar tus cuentas.</p></div>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 bg-blue-500/20 p-1 rounded text-blue-500"><Code size={14}/></div>
                    <div><strong className={`text-sm ${tc.textHighlight}`}>Sistemas Simples</strong><p className={`text-xs ${tc.textMuted} mt-0.5`}>Desarrollamos interfaces muy sencillas. Si sabes enviar un WhatsApp, podrás usar nuestro software.</p></div>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 bg-purple-500/20 p-1 rounded text-purple-500"><Users size={14}/></div>
                    <div><strong className={`text-sm ${tc.textHighlight}`}>Trato Humano y Directo</strong><p className={`text-xs ${tc.textMuted} mt-0.5`}>Sin intermediarios. Hablamos de tu negocio con total honestidad, no con terminología técnica.</p></div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PREGUNTAS FRECUENTES (FAQs) --- */}
      <section className={`py-20 border-y ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100 border-slate-200'} relative z-10`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Preguntas Frecuentes</span>
            <h2 className={`text-2xl md:text-3xl font-bold ${tc.textHighlight} mt-2`}>Resolvemos tus dudas</h2>
          </div>
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${tc.cardBg}`}>
              <h3 className={`text-sm font-bold ${tc.textHighlight} mb-2`}>¿Necesito tener conocimientos técnicos o saber programar?</h3>
              <p className={`text-xs ${tc.text} leading-relaxed`}>Para nada. Nosotros nos encargamos de todo el desarrollo, configuración e integración. Te entregamos herramientas amigables y te capacitamos para usarlas en minutos.</p>
            </div>
            <div className={`p-6 rounded-xl border ${tc.cardBg}`}>
              <h3 className={`text-sm font-bold ${tc.textHighlight} mb-2`}>¿Para qué tamaño de negocio están pensados sus servicios?</h3>
              <p className={`text-xs ${tc.text} leading-relaxed`}>Nos especializamos en PyMEs, comercios locales y negocios en crecimiento. Adaptamos las soluciones a tus flujos reales y presupuesto, asegurando que cada automatización genere un retorno de inversión visible.</p>
            </div>
            <div className={`p-6 rounded-xl border ${tc.cardBg}`}>
              <h3 className={`text-sm font-bold ${tc.textHighlight} mb-2`}>¿Cómo se integra la automatización en mi negocio día con día?</h3>
              <p className={`text-xs ${tc.text} leading-relaxed`}>Las soluciones se integran de forma práctica: por ejemplo, respondiendo automáticamente a tus clientes en WhatsApp con información exacta de tus servicios, o agilizando el llenado de datos y cotizaciones de manera inmediata.</p>
            </div>
            <div className={`p-6 rounded-xl border ${tc.cardBg}`}>
              <h3 className={`text-sm font-bold ${tc.textHighlight} mb-2`}>¿Cómo empezamos a trabajar juntos?</h3>
              <p className={`text-xs ${tc.text} leading-relaxed`}>Es muy sencillo. Primero agendamos una plática de diagnóstico gratuita de 15 minutos en el formulario de abajo. Conversamos de tu negocio y te damos 3 ideas de mejora inmediatas. Si decides avanzar, nosotros ejecutamos todo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACTO / FORMULARIO SIMPLIFICADO --- */}
      <section id="contact" className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">¿Hablamos?</span>
          <h2 className={`text-3xl md:text-4xl font-bold ${tc.textHighlight} mt-2 mb-6`}>Platiquemos sobre tu negocio</h2>
          <p className={`mb-8 max-w-xl mx-auto text-sm ${tc.text} font-light`}>
            Conversemos 15 minutos sin compromiso. Te daremos 3 ideas concretas para mejorar tu operación.
          </p>
          
          <a
            href="https://wa.me/524442227225?text=Hola%20DS%20Consulting%2C%20me%20interesa%20saber%20c%C3%B3mo%20pueden%20ayudar%20a%20mi%20negocio."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-2xl hover:shadow-green-500/40 transition-all hover:scale-105 mb-10"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Escríbenos por WhatsApp
          </a>
          
          <p className={`text-xs ${tc.textMuted} mb-6`}>¿Prefieres dejar tus datos? Usa este formulario:</p>
          
          <form onSubmit={handleSubmit} className={`p-8 rounded-xl border max-w-lg mx-auto text-left shadow-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
            {submitMessage && (
              <div className={`p-4 mb-4 text-xs rounded-lg ${submitMessage.includes('éxito') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                {submitMessage}
              </div>
            )}
            <div className="mb-4">
              <label className={`block text-xs font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Nombre / Empresa</label>
              <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className={`w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 ${tc.inputBg}`} placeholder="Ej: Juan de Pizzería Central" />
            </div>
            <div className="mb-4">
              <label className={`block text-xs font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>WhatsApp o Correo de contacto</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleFormChange} required className={`w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 ${tc.inputBg}`} placeholder="Ej: +52 123 456 7890 o juan@correo.com" />
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <label className={`block text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>¿Cuál es tu mayor cuello de botella hoy?</label>
                <button type="button" onClick={handleMagicDraft} disabled={aiLoading.draft || !formData.challenge} className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}>
                  {aiLoading.draft ? <Loader2 className="animate-spin" size={10} /> : <Sparkles size={10} />}
                  {aiLoading.draft ? 'Redactando...' : '✨ Mejorar texto'}
                </button>
              </div>
              <textarea name="challenge" rows="3" value={formData.challenge} onChange={handleFormChange} required className={`w-full p-2.5 text-sm rounded-lg focus:ring-blue-500 resize-none ${tc.inputBg}`} placeholder="Ej: Perdemos mucho tiempo enviando facturas y el WhatsApp se satura de dudas básicas..." />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg disabled:bg-indigo-400">
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>

          {/* Contacto Directo */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className={`flex flex-col sm:flex-row items-center gap-4 text-xs ${tc.textMuted}`}>
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-blue-500" /> danielsilvestredj@gmail.com</span>
              <span className="hidden sm:block text-slate-700">•</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-500" /> San Luis Potosí, México</span>
            </div>
            <div className="flex gap-6 mt-2">
              <a href="https://www.linkedin.com/in/dansilver9" target="_blank" rel="noopener noreferrer" className={`transform hover:scale-110 ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}><Linkedin size={24} /></a>
              <a href="https://github.com/Dansilverdj" target="_blank" rel="noopener noreferrer" className={`transform hover:scale-110 ${theme === 'dark' ? 'text-slate-400 hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'}`}><Code size={24} /></a>
            </div>
          </div>

          <div className={`mt-12 pt-8 border-t ${theme === 'dark' ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-500'} text-xs`}>
            <p>&copy; {new Date().getFullYear()} DS Consulting. Todos los derechos reservados.</p>
          </div>
        </div>
      </section>
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/524442227225?text=Hola%20DS%20Consulting%2C%20quiero%20mejorar%20mi%20negocio."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <span className="absolute right-full mr-3 bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          ¡Escríbenos ahora!
        </span>
      </a>
    </div>
  );
}
