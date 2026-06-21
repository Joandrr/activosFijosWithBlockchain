import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FiMessageSquare, FiX, FiSend, FiCpu, FiUser, FiLayers } from "react-icons/fi";
import { searchDataset } from "../services/dataset.service";
import type { DatasetAsset } from "../services/dataset.service";
import { useAuth } from "../context/AuthContext";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  assetResult?: DatasetAsset[];
  suggestions?: string[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  const location = useLocation();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper to parse **bold** and *italic* markdown strings to neat JSX elements
  const renderTextWithFormatting = (text: string) => {
    // Split by ** first to find bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={i} className="font-extrabold text-indigo-400">
            {boldText}
          </strong>
        );
      }
      
      // Now split by * to find italic text
      const subParts = part.split(/(\*[^*]+\*)/g);
      return subParts.map((subPart, j) => {
        if (subPart.startsWith("*") && subPart.endsWith("*")) {
          return (
            <em key={`${i}-${j}`} className="italic text-slate-350 bg-slate-950/40 px-1.5 py-0.5 rounded">
              {subPart.slice(1, -1)}
            </em>
          );
        }
        return subPart;
      });
    });
  };

  // Get current page context description
  const getContextInfo = () => {
    const path = location.pathname;
    const roleName = user?.rol_id === 1 ? "Administrador" : user?.rol_id === 3 ? "Administrativo" : user?.rol_id === 4 ? "Jefe de Centro" : "Auxiliar";
    
    if (path.includes("activos")) {
      return {
        title: "Inventario de Activos",
        tip: "Estás en el catálogo de activos fijos. Los administradores pueden presionar '+ Nuevo Activo' para registrar equipos y generar firmas en DynamoDB.",
        suggestions: ["¿Cómo registro un activo?", "¿Cómo doy de baja un activo?", "Buscar activo Dell", "Verificar firma notarial"],
      };
    } else if (path.includes("movimientos")) {
      return {
        title: "Movimientos y Traslados",
        tip: "Estás en traslados. Aquí se inician movimientos con '+ Nuevo Movimiento' y se firman en el 'Panel Firmas' (Firma dual: Emisor + Receptor).",
        suggestions: ["¿Cómo funciona la firma dual?", "¿Cómo firmar un traslado?", "Buscar traslado en dataset", "Descargar contrato PDF"],
      };
    } else if (path.includes("validador")) {
      return {
        title: "Validador Notarial",
        tip: "Estás en el validador. Pega un UUID (ID de contrato) del ledger para auditar de forma criptográfica su firma e integridad contra DynamoDB.",
        suggestions: ["¿Qué es la integridad notarial?", "Buscar activo Lenovo", "¿Cómo auditar un traslado?"],
      };
    } else if (path.includes("administracion") || path.includes("usuarios")) {
      return {
        title: "Administración del Sistema",
        tip: "Aquí administras la taxonomía general (aulas, marcas) y los accesos de usuarios.",
        suggestions: ["¿Cómo creo un usuario?", "¿Cómo configuro un aula?"],
      };
    } else if (path.includes("manual")) {
      return {
        title: "Manual de Usuario",
        tip: "Estás en el manual interactivo. Navega por las pestañas de roles para ver los flujos de trabajo detallados paso a paso.",
        suggestions: ["Manual Administrador", "Manual Auxiliar", "Manual Jefe de Centro", "Buscar en el dataset"],
      };
    }
    return {
      title: "Dashboard Principal",
      tip: `Hola ${user?.nombre || "Usuario"} (${roleName}), estás en el panel de control. El sistema tiene registrados 10,000 activos en el dataset global de auditoría.`,
      suggestions: ["Ver manuales", "Buscar proyector Epson", "¿Qué hace la blockchain?"],
    };
  };

  const context = getContextInfo();

  // Send initial message on load or path change
  useEffect(() => {
    const welcomeMsg: Message = {
      sender: "bot",
      text: `🤖 **¡Hola! Soy tu asistente de Activos FICCT.**\n\n*Contexto actual:* **${context.title}**\n${context.tip}\n\n¿En qué te puedo ayudar hoy? Puedes hacerme preguntas sobre los flujos o buscar directamente en nuestro dataset de 10,000 activos fijos.`,
      timestamp: new Date(),
      suggestions: context.suggestions,
    };
    setMessages([welcomeMsg]);
  }, [location.pathname, user]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate bot response delay
    setTimeout(() => {
      const response = processBotResponse(textToSend);
      setMessages((prev) => [...prev, response]);
    }, 450);
  };

  const processBotResponse = (query: string): Message => {
    const q = query.toLowerCase().trim();
    
    // Clean query to isolate search keys (remove filler/helper words)
    const cleanSearch = q
      .replace(/como|cómo|se|un|una|el|la|los|las|de|en|para|donde|dónde|está|esta|quien|quién|hacer|que|qué|buscar|find|finds/g, "")
      .trim();

    // 1. Semantic intent scoring
    let bestIntent: "saludo" | "registro" | "baja" | "traslado" | "integridad" | "usuarios" | "admin" | "auxiliar" | "receptor" | null = null;
    let maxScore = 0;

    const intentsList = [
      {
        id: "saludo" as const,
        keywords: ["hola", "buen", "dia", "día", "tarde", "noche", "saludos", "asistente", "quien", "quién", "ayuda", "ayúdame", "que haces", "qué haces"]
      },
      {
        id: "registro" as const,
        keywords: ["registrar", "registro", "crear", "nuevo", "alta", "agregar", "adicionar", "guardar", "insertar", "subir", "ingresar", "ficha", "incorporar"]
      },
      {
        id: "baja" as const,
        keywords: ["baja", "eliminar", "borrar", "quitar", "desincorporar", "desactivar", "retirar", "obsoleto", "dañado", "daño", "perdido", "pérdida"]
      },
      {
        id: "traslado" as const,
        keywords: ["firma", "firmar", "qr", "doble", "traslado", "movimiento", "mover", "transferir", "aprobar", "autorizar", "recepcion", "recepción", "salida", "entrada", "emisor", "receptor", "enviar", "despachar", "recibir"]
      },
      {
        id: "integridad" as const,
        keywords: ["validar", "validador", "auditar", "auditoria", "auditoría", "blockchain", "ledger", "dynamodb", "sello", "hash", "cripto", "criptográfico", "verificar", "verificación", "seguridad", "integro", "integridad", "contrato", "uuid"]
      },
      {
        id: "usuarios" as const,
        keywords: ["usuario", "usuarios", "rol", "roles", "permiso", "permisos", "personal", "empleado", "administrador", "auxiliar", "jefe", "receptor", "administrativo", "cuentas"]
      },
      {
        id: "admin" as const,
        keywords: ["manual admin", "manual administrador", "administración", "administrador", "admin"]
      },
      {
        id: "auxiliar" as const,
        keywords: ["manual aux", "manual auxiliar", "auxiliar", "emisor"]
      },
      {
        id: "receptor" as const,
        keywords: ["manual jefe", "manual receptor", "jefe de centro", "jefe", "manual administrativo", "administrativo"]
      }
    ];

    intentsList.forEach((intent) => {
      let score = 0;
      intent.keywords.forEach((keyword) => {
        if (q.includes(keyword)) {
          score += 1;
        }
      });
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent.id;
      }
    });

    // 2. Fetch matches from the 10k items dataset
    let datasetResults: DatasetAsset[] = [];
    if (cleanSearch.length >= 2) {
      datasetResults = searchDataset(cleanSearch);
    }

    // 3. Draft the corresponding response text
    let responseText = "";
    let suggestions: string[] = [];

    if (maxScore > 0 && bestIntent) {
      switch (bestIntent) {
        case "saludo":
          responseText = `👋 ¡Hola! Soy tu **Asistente Virtual de Activos FICCT**. Estoy aquí para ayudarte a:\n\n1. Entender los flujos del sistema según tu rol (**alta, baja, traslados**).\n2. Consultar el dataset del inventario global (tenemos **10,000 activos simulados**).\n3. Validar firmas criptográficas de DynamoDB.\n\n¿De qué rol te gustaría recibir asistencia o qué equipo deseas buscar?`;
          suggestions = ["¿Cómo registro un activo?", "Manual Auxiliar", "Buscar proyector Epson"];
          break;
        case "registro":
          responseText = `📝 **Cómo Registrar un Activo (Alta de Bien):**\n\n1. Ve a la sección **Activos** en el panel lateral.\n2. Presiona el botón **"+ Nuevo Activo"** (arriba a la derecha).\n3. Rellena los datos básicos: Código único, Nombre, Tipo, Marca y Ubicación inicial.\n4. Haz clic en **"Crear Activo"**.\n\n🔒 *Ledger Criptográfico:* El sistema genera de forma automática un contrato en el ledger inmutable de DynamoDB. El activo se creará con la etiqueta **"Firmado (Notaría)"** y un UUID de contrato.`;
          suggestions = ["¿Cómo doy de baja un activo?", "Verificar integridad notarial"];
          break;
        case "baja":
          responseText = `🗑️ **Cómo Dar de Baja un Activo (Retiro Definitivo):**\n\n1. Ve a la pestaña **Activos** en el menú.\n2. Busca el activo en la tabla usando el buscador.\n3. Presiona el botón de eliminar (**"Dar de baja"** con icono de basurero).\n4. Confirma la acción en el aviso emergente.\n\n⚠️ *Efecto:* El activo cambia su estado permanentemente y se sella su baja con firma criptográfica en el ledger notarial de DynamoDB. No se podrá volver a trasladar.`;
          suggestions = ["¿Cómo registro un activo?", "Verificar integridad"];
          break;
        case "traslado":
          responseText = `✍️ **Flujo de Firma Dual para Traslados (Movimientos):**\n\n1. **Emisión:** El Auxiliar va a **Movimientos** -> **+ Nuevo Movimiento**. Selecciona el activo y destino, y presiona **Crear** (creado *En Proceso*).\n2. **Firma Emisor (Salida):** En el **Panel Firmas**, el emisor hace clic en **"Firmar Emisor"** o escanea el *QR Paso 1* desde la app móvil.\n3. **Firma Receptor (Entrada):** El receptor hace clic en **"Firmar Receptor"** o escanea el *QR Paso 2*.\n4. **Ejecución:** Al completarse ambas firmas, el traslado pasa a **"Ejecutado"**, el activo cambia su ubicación automáticamente en PostgreSQL y se sella el contrato final.`;
          suggestions = ["¿Cómo funciona la firma dual?", "Verificar validador"];
          break;
        case "integridad":
          responseText = `🛡️ **Integridad Notarial y Auditoría:**\n\nPara comprobar que la base de datos relacional (PostgreSQL) no haya sido alterada o manipulada:\n1. Copia el **ID de Contrato (UUID)** del activo o del traslado.\n2. Ve a la pestaña **Validador Notarial**.\n3. Pega el UUID en la barra de búsqueda y presiona **"Auditar Contrato"**.\n4. El validador comparará las firmas y hashes almacenados en DynamoDB. Si el estado es **"Verificado"**, los datos son 100% íntegros.`;
          suggestions = ["Buscar activo Lenovo", "¿Cómo funciona la firma dual?"];
          break;
        case "usuarios":
          responseText = `👥 **Matriz de Privilegios y Usuarios:**\n\nLos administradores configuran los accesos en la pestaña **Usuarios** asignando uno de los siguientes perfiles:\n- **Administrador:** Altas, bajas, administración de marcas/lugares y usuarios.\n- **Auxiliar:** Emisión de traslados y firma de salida (Emisor).\n- **Administrativo / Jefe de Centro:** Firma de recepción en destino (Receptor).`;
          suggestions = ["Manual Administrador", "Manual Auxiliar", "Manual Jefe de Centro"];
          break;
        case "admin":
          responseText = `👑 **Manual del Administrador:**\n\nTus operaciones clave son:\n1. **Registrar Activos:** Pestaña *Activos* -> Botón *+ Nuevo Activo*.\n2. **Dar de Baja:** Pestaña *Activos* -> Acción *basurero*.\n3. **Configurar Catálogos:** Pestaña *Administración* (Lugares, Marcas, Tipos).\n4. **Gestión de Personal:** Pestaña *Usuarios* -> *+ Nuevo Usuario*.`;
          suggestions = ["¿Cómo registro un activo?", "Manual Auxiliar"];
          break;
        case "auxiliar":
          responseText = `👷 **Manual del Auxiliar (Emisor):**\n\nTus responsabilidades diarias:\n1. **Crear Traslados:** Pestaña *Movimientos* -> Botón *+ Nuevo Movimiento*.\n2. **Firmar Salida:** Abre el *Panel Firmas* de la transferencia y haz clic en *Firmar Emisor* (o muestra el QR para la app móvil).`;
          suggestions = ["¿Cómo funciona la firma dual?", "Manual Jefe de Centro"];
          break;
        case "receptor":
          responseText = `🏫 **Manual de Jefe de Centro / Administrativo (Receptor):**\n\nTu función principal:\n1. **Confirmar Ingreso:** Ve a *Movimientos*, busca los traslados pendientes dirigidos a tu ubicación.\n2. **Firmar Recepción:** Abre el *Panel Firmas* y presiona el botón *Firmar Receptor* (o escanea el QR con tu móvil) para autorizar la entrada física del equipo y actualizar el inventario.`;
          suggestions = ["¿Cómo funciona la firma dual?", "Verificar validador"];
          break;
      }
      
      // If an FAQ is matched but we ALSO found dataset matches, let's append them!
      if (datasetResults.length > 0) {
        responseText += `\n\n🔍 *Activos relacionados en el inventario (${datasetResults.length}):*`;
      }
    } else {
      // No FAQ matched. Fall back to dataset results.
      if (datasetResults.length > 0) {
        responseText = `🔍 He buscado en el dataset de **10,000 activos** y encontré **${datasetResults.length} coincidencias** para *"${cleanSearch}"*:`;
        suggestions = ["¿Cómo se traslada un activo?", "Verificar integridad notarial"];
      } else {
        // Fallback welcome/guide
        responseText = `💡 Hola, no he detectado una consulta sobre un flujo específico.\n\n*Puedes preguntarme cosas como:*\n- *"¿Cómo dar de alta un equipo?"*\n- *"¿Cómo firmo un traslado?"*\n- *"¿Qué es la doble firma?"*\n- *"¿Cómo auditar un contrato?"*\n\nO busca en los **10,000 activos** del dataset escribiendo palabras clave como: **"buscar Dell"**, **"buscar Aula 101"**, **"dónde está el proyector"**, o ingresando códigos como **"ACT-COM-0005"**.`;
        suggestions = ["Buscar proyector Epson", "¿Cómo registro un activo?", "Manual Auxiliar"];
      }
    }

    return {
      sender: "bot",
      text: responseText,
      timestamp: new Date(),
      assetResult: datasetResults,
      suggestions: suggestions,
    };
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-650 hover:to-purple-650 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95"
        title="Asistente de Ayuda"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-40 w-[380px] sm:w-[420px] h-[550px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 to-indigo-950/80 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                AF
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-200">Asistente Virtual FICCT</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Offline AI · 10,000 registros
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm scrollbar-thin">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                
                <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-650/15"
                    : "bg-slate-950/50 border border-white/5 rounded-bl-none text-slate-200"
                }`}>
                  <div className="whitespace-pre-line leading-relaxed font-sans text-xs space-y-1">
                    {renderTextWithFormatting(msg.text)}
                  </div>

                  {/* Render simulated asset results */}
                  {msg.assetResult && msg.assetResult.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.assetResult.map((asset) => (
                        <div key={asset.id} className="bg-slate-900 border border-white/10 rounded-xl p-3 text-[11px] font-mono text-slate-300 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-1 bg-indigo-500/10 text-indigo-400 border-l border-b border-white/10 text-[9px] uppercase tracking-wider font-bold">
                            {asset.tipo}
                          </div>
                          <p className="font-bold text-indigo-400 text-xs mb-1">{asset.codigo}</p>
                          <p className="text-slate-200 font-bold font-sans mb-1">{asset.nombre}</p>
                          <p className="flex items-center gap-1 text-[10px] text-slate-450"><FiLayers size={10} /> <strong>Marca:</strong> {asset.marca}</p>
                          <p className="flex items-center gap-1 text-[10px] text-slate-450"><FiCpu size={10} /> <strong>Ubicación:</strong> {asset.ubicacion}</p>
                          <p className="flex items-center gap-1 text-[10px] text-slate-450"><FiUser size={10} /> <strong>Responsable:</strong> {asset.responsable}</p>
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              asset.estado === "Excelente" || asset.estado === "Bueno"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : asset.estado === "De Baja"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            }`}>
                              {asset.estado}
                            </span>
                            <span className="text-[9px] text-slate-500 truncate max-w-[120px]">{asset.sello_digital.substring(0, 16)}...</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Render quick suggestion chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 justify-start max-w-[90%]">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-slate-950/40 border-t border-white/5 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta o busca un activo (Dell, Lenovo)..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-650/15 disabled:opacity-50 cursor-pointer"
            >
              <FiSend size={14} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
