import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Linkedin, Mail, Smartphone,
  Terminal, Bot, Layout, CheckCircle2,
  GraduationCap, Sun, Moon, Code, Sparkles, Loader2, Lightbulb,
  ArrowRight, TrendingUp, Users, ShieldCheck, Quote,
  Database, Server, Cpu, BarChart3, Lock, MapPin
} from 'lucide-react';

// --- IMPORTACIÓN DE IMÁGENES DE SOFTWARE ---
import financeImg from './assets/finance.png';
import posImg from './assets/pos.png';
import accessImg from './assets/access.png';

// --- IMPORTACIÓN DE IMÁGENES DE BRANDING ---
import brandMainImg from './assets/brand-main.png'; 
import brandVehicleImg from './assets/brand-vehicle.png'; 
import brandStationeryImg from './assets/brand-stationery.png'; 

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

  // --- INTEGRACIÓN GEMINI API (ACTUALIZADA A GEMINI 2.0/2.5) ---
  const callGemini = async (prompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    
    // Si no hay API Key, simulamos directamente
    if (!apiKey) {
      console.warn("Falta API Key, activando modo simulación.");
      return simulateResponse(prompt);
    }

    // LISTA DE MODELOS A PROBAR
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

  // Función de respaldo
  const simulateResponse = (prompt) => {
    if (prompt.includes("ideas")) {
      return `🚀 Estrategia Generada (Modo Respaldo):\n\n1. 🤖 Chatbot de WhatsApp: Implementar respuestas automáticas para preguntas frecuentes (horarios, precios). Ahorra aprox. 2 horas diarias de atención al cliente.\n2. 📧 Recuperación de Clientes: Sistema automático de correos para clientes que no han comprado en 30 días. Costo bajo, alto retorno de inversión.\n3. 📊 Tablero de Control (Dashboard): Un panel simple en tu celular para ver ventas e inventario en tiempo real y tomar decisiones rápidas.`;
    } else {
      return `Estimado Daniel Silvestre,\n\nMe pongo en contacto con usted para solicitar una consultoría profesional. He revisado su trayectoria y considero que su experiencia en QA y optimización de procesos sería de gran valor para escalar mi negocio.\n\nQuedo a la espera de su respuesta para coordinar una breve reunión de diagnóstico.\n\nAtentamente,\n[Tu Nombre/Empresa]`;
    }
  };

  const handleGenerateIdeas = async () => {
    if (!businessInput.trim()) return;
    setAiLoading(prev => ({ ...prev, ideas: true }));
    setGeneratedIdeas(null);

    const prompt = `Actúa como Daniel Silvestre, consultor experto. Negocio: "${businessInput}". Dame 3 ideas rentables de automatización/IA. Formato lista con emojis.`;

    const result = await callGemini(prompt);
    setGeneratedIdeas(result);
    setAiLoading(prev => ({ ...prev, ideas: false }));
  };

  const handleMagicDraft = async () => {
    if (!formData.message.trim()) return;
    setAiLoading(prev => ({ ...prev, draft: true }));

    const prompt = `Reescribe formalmente para Daniel Silvestre: "${formData.message}"`;

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
    const mouseLineColor = theme === '
