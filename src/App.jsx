import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Linkedin, Mail, Smartphone, 
  Terminal, Bot, Layout, CheckCircle2, 
  GraduationCap, Sun, Moon, Code, Sparkles, Loader2, Lightbulb
} from 'lucide-react';

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  // NUEVO ESTADO PARA EL TEMA
  const [theme, setTheme] = useState('dark'); 
  
  // --- ESTADOS PARA FUNCIONES IA ---
  const [aiLoading, setAiLoading] = useState({ draft: false, ideas: false });
  const [businessInput, setBusinessInput] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState(null);
  
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
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
    // CORRECCIÓN DE ERROR DE COMPILACIÓN:
    // Hemos simplificado esto temporalmente para evitar el error "import.meta is not available".
    // 1. Para pruebas locales: Pega tu API Key dentro de las comillas vacías abajo.
    // 2. Para producción (Vercel): Puedes descomentar la línea de import.meta si configuras el target a ES2020+.
    
    const apiKey = ""; 
    // const apiKey = import.meta.env.VITE_GEMINI_KEY || "";

    if (!apiKey) {
      console.warn("Falta la API Key de Gemini. La funcionalidad de IA simulará una respuesta o fallará.");
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
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
    Formato: Lista con viñetas cortas. Usa emojis. Tono: Profesional pero entusiasta.`;

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

    // --- CONFIGURACIÓN DE ENVÍO REAL ---
    const formspreeEndpoint = "https://formspree.io/f/xldyyknb"; 

    // Verificación de seguridad
    if (!formspreeEndpoint || formspreeEndpoint === "https://formspree.io/f/xldyyknb") {
        console.warn("⚠️ FALTA CONFIGURAR FORMSPREE");
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitMessage('⚠️ ATENCIÓN: Algo salio mal favor de contactar directamente al correo: danielsilvestredj@gmail.com.');
        }, 1000);
        return;
    }

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitMessage('¡Mensaje enviado con éxito! Daniel se pondrá en contacto contigo pronto.');
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

  // --- EFECTO DE FONDO INTERACTIVO (PARTÍCULAS/RED NEURONAL) ---
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
        this.vx = (Math.random() - 0.5) * 0.5; // Velocidad lenta
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Rebotar en bordes
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
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor.replace('0.15', `${0.15 - distance/120 * 0.15}`);
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        
        // Conectar con el mouse (Interacción)
        const dxMouse = particles[i].x - mousePos.x;
        const dyMouse = particles[i].y - mousePos.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        if (distMouse < 200) {
          ctx.beginPath();
          ctx.strokeStyle = mouseLineColor.replace('0.2', `${0.2 - distMouse/200 * 0.2}`); 
          ctx.lineWidth = 1.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mousePos.x, mousePos.y);
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
  }, [mousePos, theme]); // DEPENDENCIA DE TEMA AÑADIDA

  // Manejador de movimiento del mouse para el efecto
  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if(rect) {
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  // Navegación suave
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
      const sections = ['home', 'about', 'services', 'experience', 'contact'];
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
      timelineBg: 'border-slate-800',
      text: 'text-slate-300',
      textMuted: 'text-slate-500',
      inputBg: 'bg-slate-800 border-slate-700 text-white placeholder-slate-500',
    },
    light: {
      bg: 'bg-slate-50 text-slate-800 selection:bg-indigo-600',
      navBg: 'bg-white/80 border-slate-200/50',
      sectionBg1: 'bg-slate-100/90 border-slate-200',
      sectionBg2: 'bg-slate-50/90',
      cardBg: 'bg-white/90 border-slate-200 hover:border-indigo-500/50',
      timelineBg: 'border-slate-300',
      text: 'text-slate-600',
      textMuted: 'text-slate-500',
      inputBg: 'bg-white border-slate-300 text-slate-800 placeholder-slate-400',
    }
  };

  const tc = themeClasses[theme]; // Atajos para las clases del tema

  return (
    <div 
      className={`min-h-screen font-sans relative ${tc.bg}`}
      onMouseMove={handleMouseMove}
    >
      {/* ESTILOS PERSONALIZADOS PARA LA ANIMACIÓN VERDE */}
      <style>{`
        @keyframes greenPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
            border-color: rgba(74, 222, 128, 0.2);
          }
          50% {
            box-shadow: 0 0 20px 0 rgba(74, 222, 128, 0.4);
            border-color: rgba(74, 222, 128, 1);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
            border-color: rgba(74, 222, 128, 0.2);
          }
        }
        .animate-green-pulse {
          animation: greenPulse 3s infinite ease-in-out;
        }
      `}</style>

      {/* CANVAS FONDO INTERACTIVO */}
      <canvas 
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-60"
      />
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b ${tc.navBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                DS.
              </span>
            </div>
            
            <div className="flex items-center">
              {/* Desktop Menu */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {['Inicio', 'Sobre Mí', 'Servicios', 'Trayectoria', 'Contacto'].map((item, index) => {
                    const id = ['home', 'about', 'services', 'experience', 'contact'][index];
                    return (
                      <button
                        key={item}
                        onClick={() => scrollToSection(id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-indigo-500 ${
                          activeSection === id ? 'text-indigo-500 scale-105' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Theme Switch */}
              <button
                onClick={toggleTheme}
                className={`ml-4 p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-100'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Mobile Menu Button */}
              <div className="md:hidden ml-2">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`inline-flex items-center justify-center p-2 rounded-md ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'} focus:outline-none`}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className={`md:hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Inicio', 'Sobre Mí', 'Servicios', 'Trayectoria', 'Contacto'].map((item, index) => {
                const id = ['home', 'about', 'services', 'experience', 'contact'][index];
                return (
                  <button
                    key={item}
                    onClick={() => scrollToSection(id)}
                    className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative z-10 pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            {/* BADGE ACTUALIZADO A VERDE Y CON ANIMACIÓN DE PULSO */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full border border-green-500/30 ${theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-500/20 text-green-700'} text-sm font-medium mb-6 backdrop-blur-sm animate-green-pulse transition-all duration-500`}>
              <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Disponible para proyectos
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg">
              J Daniel <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Silvestre</span>
            </h1>
            <p className={`text-xl md:text-2xl ${tc.text} mb-8 max-w-2xl mx-auto md:mx-0 font-light drop-shadow-md`}>
              QA Engineer & Consultor de Negocios. <br/>
              <span className="text-indigo-400 font-normal">Fusiono la Administración de Empresas con la Inteligencia Artificial</span> para escalar PYMES.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => scrollToSection('contact')}
                className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] z-20"
              >
                Hablemos de tu Proyecto
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className={`px-8 py-3 rounded-lg border ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500 text-slate-300 hover:text-white' : 'border-slate-300 bg-white/50 hover:bg-slate-100 hover:border-slate-400 text-slate-700 hover:text-slate-900'} font-medium transition-all backdrop-blur-sm z-20`}
              >
                Ver Servicios
              </button>
            </div>
          </div>
          
          {/* SECCIÓN DE IA REUBICADA EN LUGAR DE LA FOTO */}
          <div className="flex-1 z-10 w-full">
            {/* --- FEATURE IA: DEMO DE CONSULTORÍA --- */}
            <div className={`p-8 rounded-2xl border bg-gradient-to-br ${theme === 'dark' ? 'from-slate-900 via-indigo-950/30 to-slate-900' : 'from-white via-indigo-50 to-white'} relative overflow-hidden shadow-2xl animate-green-pulse transition-all duration-500`}>
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Bot size={100} />
               </div>
               
               <div className="relative z-10 text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold mb-4 border border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                   <Sparkles size={12} className="animate-pulse" /> POWERED BY GEMINI API
                 </div>
                 <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-3`}>
                   ¿Qué puede hacer la IA por tu negocio?
                 </h3>
                 <p className={`text-sm mb-6 ${tc.text}`}>
                   Prueba mi <strong>Generador de Estrategias</strong>. Dime qué tipo de negocio tienes y te daré 3 ideas rápidas de automatización.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
                   <input 
                     type="text" 
                     value={businessInput}
                     onChange={(e) => setBusinessInput(e.target.value)}
                     placeholder="Ej: Panadería, Taller Mecánico, Abogados..."
                     className={`flex-1 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${tc.inputBg}`}
                   />
                   <button 
                     onClick={handleGenerateIdeas}
                     disabled={aiLoading.ideas || !businessInput}
                     className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                   >
                     {aiLoading.ideas ? <Loader2 className="animate-spin" size={20}/> : <><Lightbulb size={20}/> Generar Ideas</>}
                   </button>
                 </div>

                 {generatedIdeas && (
                   <div className={`text-left p-6 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme === 'dark' ? 'bg-slate-950/80 border-indigo-500/50' : 'bg-white/80 border-indigo-200'} max-h-60 overflow-y-auto`}>
                     <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2 sticky top-0 bg-opacity-90 backdrop-blur-sm py-2">
                       <Bot size={18}/> Estrategia Sugerida:
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

      {/* --- ABOUT SECTION --- */}
      <section id="about" className={`relative z-10 py-20 backdrop-blur-sm ${tc.sectionBg1}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-6 flex items-center gap-3`}>
                <Terminal className="text-blue-500" />
                El puente entre Negocio y Código
              </h2>
              <div className={`space-y-4 leading-relaxed ${tc.text}`}>
                <p>
                  No soy el típico desarrollador, ni el típico administrador. Soy un híbrido. 
                  Como <strong className="text-indigo-500">Licenciado en Administración de Empresas</strong>, entiendo de flujos de caja, gestión de personal y dolores operativos.
                </p>
                <p>
                  Como <strong className="text-blue-500">QA Engineer</strong>, tengo la disciplina técnica para crear sistemas a prueba de fallos. 
                  Hoy, uso esa doble visión para ayudar a empresas a modernizarse mediante 
                  <strong className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}> Automatización e Inteligencia Artificial</strong>.
                </p>
                <p>
                  Mi misión es simple: eliminar el trabajo repetitivo de tu negocio para que tú te dediques a crecer.
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} border`}>
                  <div className="text-3xl font-bold text-blue-500 mb-1">+5</div>
                  <div className={`text-sm ${tc.textMuted}`}>Años Gestionando Proyectos</div>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} border`}>
                  <div className="text-3xl font-bold text-indigo-500 mb-1">+200</div>
                  <div className={`text-sm ${tc.textMuted}`}>Incidencias Técnicas Resueltas/Mes</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-6`}>Mi Stack Tecnológico</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Python', icon: '🐍', level: 'Backend & Scripts' },
                  { name: 'Selenium', icon: '🤖', level: 'Automatización' },
                  { name: 'SQL', icon: '🗄️', level: 'Bases de Datos' },
                  { name: 'JIRA', icon: '📋', level: 'Gestión Ágil' },
                  { name: 'Postman', icon: '🚀', level: 'API Testing' },
                  { name: 'IA Agents', icon: '🧠', level: 'Consultoría IA' },
                  { name: 'SPSS', icon: '📊', level: 'Análisis de Datos' },
                  { name: 'React', icon: '⚛️', level: 'Desarrollo Web' },
                ].map((tech) => (
                  <div key={tech.name} className={`flex items-center gap-3 p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800 hover:border-blue-500/50' : 'bg-white/80 border-slate-200 hover:border-indigo-500/50'} transition-colors`}>
                    <span className="text-2xl">{tech.icon}</span>
                    <div>
                      <div className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} font-medium`}>{tech.name}</div>
                      <div className="text-xs text-slate-500">{tech.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section id="services" className="relative z-10 py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            {/* TÍTULO CON EFECTO DE PULSO VERDE AÑADIDO */}
            <div className={`inline-block px-8 py-4 rounded-2xl border border-green-500/30 ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-sm animate-green-pulse mb-6 shadow-xl`}>
              <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500`}>
                Soluciones para la Era Digital
              </h2>
            </div>
            
            <p className={`max-w-2xl mx-auto ${tc.text}`}>
              Especializado en modernizar PYMES mediante estrategias que combinan marketing, calidad de software y automatización inteligente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Servicio 1 */}
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 shadow-lg`}>
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-3`}>Consultoría IA & Automatización</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>
                Implementación de agentes de IA para atención al cliente y automatización de flujos de trabajo repetitivos. Ahorra horas hombre y reduce errores operativos.
              </p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500"/> Chatbots Inteligentes</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500"/> Automatización de Email</li>
              </ul>
            </div>

            {/* Servicio 2 */}
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 relative shadow-lg`}>
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">Core Skill</div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <CheckCircle2 className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-3`}>QA & Testing de Software</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>
                Aseguramiento de calidad para productos digitales. Antes de lanzar tu web o app, me aseguro de que funcione perfectamente bajo cualquier condición.
              </p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500"/> Pruebas Automatizadas</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500"/> Testing de API & Móvil</li>
              </ul>
            </div>

            {/* Servicio 3 */}
            <div className={`p-8 rounded-2xl border ${tc.cardBg} transition-all duration-300 group hover:-translate-y-2 shadow-lg`}>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <Layout className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-3`}>Web Dev & Marketing Tech</h3>
              <p className={`text-sm mb-6 leading-relaxed ${tc.text}`}>
                Desarrollo de sitios web modernos (Landing Pages, Corporativas) y estrategias de marketing digital basadas en análisis de datos reales.
              </p>
              <ul className="text-sm text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Sitios Web Responsivos</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Análisis de Datos (Data-Driven)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- EXPERIENCE / TIMELINE --- */}
      <section id="experience" className={`relative z-10 py-20 backdrop-blur-sm ${tc.sectionBg1}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-12 text-center`}>Trayectoria Profesional</h2>
          
          <div className={`relative border-l-2 ${tc.timelineBg} ml-4 md:ml-6 space-y-12`}>
            
            {/* Item 1: QA Engineer & Consultor IA (2025 - Actualidad) */}
            <div className="relative pl-8 md:pl-12">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ${theme === 'dark' ? 'ring-slate-900' : 'ring-slate-100'}`}></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>QA Engineer & Consultor IA</h3>
                <span className="text-sm text-blue-500 font-mono bg-blue-500/10 px-2 py-1 rounded">2025 - Actualidad</span>
              </div>
              <p className={`mb-2 ${tc.text}`}>Freelance / Proyectos Propios</p>
              <p className={`text-sm ${tc.textMuted}`}>Desarrollo de soluciones automatizadas, pruebas de software y consultoría estratégica para PYMES en San Luis Potosí.</p>
            </div>

            {/* Item 2: Administrador General (2024) */}
            <div className="relative pl-8 md:pl-12">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 ring-4 ${theme === 'dark' ? 'ring-slate-900' : 'ring-slate-100'}`}></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Administrador General</h3>
                <span className="text-sm text-slate-500 font-mono">2024</span>
              </div>
              <p className={`mb-2 ${tc.text}`}>La Zona "Smothie bar"</p>
              <p className={`text-sm ${tc.textMuted}`}>Gestión operativa y contable. Optimización de procesos administrativos y manejo de personal.</p>
            </div>

            {/* Item 3: Fundador & Gerente (2017 - 2023) */}
            <div className="relative pl-8 md:pl-12">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 ring-4 ${theme === 'dark' ? 'ring-slate-900' : 'ring-slate-100'}`}></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Fundador & Gerente</h3>
                <span className="text-sm text-slate-500 font-mono">2017 - 2023</span>
              </div>
              <p className={`mb-2 ${tc.text}`}>Lotería San Luis</p>
              <p className={`text-sm ${tc.textMuted}`}>Emprendimiento propio. Coordinación operativa, licitaciones y liderazgo de equipos multidisciplinarios bajo presión.</p>
            </div>

            {/* Item 4: Soporte Técnico B2B (2021 - 2023) */}
            <div className="relative pl-8 md:pl-12">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 ring-4 ${theme === 'dark' ? 'ring-slate-900' : 'ring-slate-100'}`}></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Soporte Técnico B2B</h3>
                <span className="text-sm text-slate-500 font-mono">2021 - 2022</span>
              </div>
              <p className={`mb-2 ${tc.text}`}>Telmex / Contactum</p>
              <p className={`text-sm ${tc.textMuted}`}>Resolución de +200 incidencias técnicas mensuales para clientes empresariales. Habilidades de comunicación técnica.</p>
            </div>
            
            {/* Education Block */}
             <div className="relative pl-8 md:pl-12 pt-8">
               <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-950/80 border-slate-700' : 'bg-white/80 border-slate-300'}`}>
                  <h4 className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-semibold mb-3`}>
                    <GraduationCap className="text-indigo-500" size={20}/> Formación Destacada
                  </h4>
                  <ul className={`space-y-2 text-sm ${tc.text}`}>
                    <li>• <strong>Lic. Administración de Empresas</strong> - Universidad Tangamanga</li>
                    <li>• <strong>QA Engineering Bootcamp</strong> - Triple Ten</li>
                    <li>• <strong>Certificado Diseño Didáctico</strong> - SEGE</li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION (FORM) --- */}
      <section id="contact" className={`relative z-10 py-20 ${tc.sectionBg2}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-6`}>¿Listo para optimizar tu negocio?</h2>
          <p className={`mb-10 max-w-xl mx-auto ${tc.text}`}>
            Completa este breve formulario y me pondré en contacto contigo para discutir cómo puedo ayudarte a escalar tu PYME con IA y calidad de software.
          </p>

          <form onSubmit={handleSubmit} className={`p-8 rounded-xl border max-w-lg mx-auto text-left shadow-2xl ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
            
            {/* Mensaje de estado de envío */}
            {submitMessage && (
              <div className={`p-4 mb-4 text-sm rounded-lg ${submitMessage.includes('éxito') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'} ${submitMessage.includes('ATENCIÓN') ? 'bg-yellow-600/20 text-yellow-400' : ''}`}>
                {submitMessage}
              </div>
            )}

            {/* Nombre */}
            <div className="mb-4">
              <label htmlFor="name" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Nombre Completo</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleFormChange}
                required
                className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${tc.inputBg}`} 
                placeholder="Tu nombre o el de tu empresa"
              />
            </div>

            {/* Correo */}
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
                placeholder="ejemplo@negocio.com"
              />
            </div>

            {/* Teléfono */}
            <div className="mb-6">
              <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Teléfono (WhatsApp)</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={handleFormChange}
                className={`w-full p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${tc.inputBg}`} 
                placeholder="55 1234 5678 (Opcional, pero acelera el contacto)"
              />
            </div>
            
            {/* Mensaje/Proyecto */}
            <div className="mb-6 relative">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="message" className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Describe tu proyecto o necesidad
                </label>
                <button
                  type="button"
                  onClick={handleMagicDraft}
                  disabled={aiLoading.draft || !formData.message}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' 
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  } disabled:opacity-50`}
                  title="Escribe una idea rápida y la IA la redactará formalmente por ti"
                >
                  {aiLoading.draft ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12}/>}
                  {aiLoading.draft ? 'Redactando...' : 'Mejorar con IA'}
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
                placeholder="Escribe tus ideas (ej: necesito app para envíos) y presiona 'Mejorar con IA' para redactarlo profesionalmente..."
              />
            </div>


            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/30 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Daniel, ¡Contáctame!'}
            </button>
          </form>

          {/* Iconos Sociales (LinkedIn y GitHub) */}
          <div className="mt-10 flex justify-center gap-6">
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/dansilver9" target="_blank" rel="noopener noreferrer" 
               className={`transition-colors transform hover:scale-110 ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}>
              <Linkedin size={28} />
            </a>
            {/* GitHub (Usando Code icon como placeholder de GitHub) */}
            <a href="https://github.com/Dansilverdj" target="_blank" rel="noopener noreferrer" 
               className={`transition-colors transform hover:scale-110 ${theme === 'dark' ? 'text-slate-400 hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'}`}>
              <Code size={28} />
            </a>
          </div>

          <div className={`mt-16 pt-8 border-t ${theme === 'dark' ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-500'} text-sm`}>
            <p>&copy; 2025 J Daniel Silvestre. San Luis Potosí, México.</p>
          </div>
        </div>
      </section>
    </div>
  );
}