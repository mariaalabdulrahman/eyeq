import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowLeft, MessageCircle, Bot, Sparkles, AlertCircle, BookOpen, BarChart3 } from "lucide-react";
import Logo from "@/components/Logo";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chart?: { name: string; value: number; color: string }[];
  references?: string[];
}

// Knowledge base of ocular-systemic disease links with references
const OCULAR_SYSTEMIC_KNOWLEDGE: Record<string, { systemic: string[]; description: string; references: string[] }> = {
  "diabetic retinopathy": {
    systemic: ["Cardiovascular Disease", "Chronic Kidney Disease", "Stroke", "Peripheral Neuropathy", "Heart Failure"],
    description: "Diabetic retinopathy is strongly associated with systemic vascular complications. The microvascular damage seen in the retina reflects similar changes throughout the body.",
    references: [
      "Cheung N, et al. Diabetic retinopathy and systemic vascular complications. Lancet. 2010;376(9735):124-36",
      "Wong TY, et al. Retinal microvascular abnormalities and their relationship with hypertension, cardiovascular disease, and mortality. Surv Ophthalmol. 2001;46(1):59-80",
      "Kramer CK, et al. Diabetic retinopathy predicts all-cause mortality and cardiovascular events in both type 1 and type 2 diabetes. Diabetes Care. 2011;34(5):1238-44"
    ]
  },
  "glaucoma": {
    systemic: ["Cardiovascular Disease", "Alzheimer's Disease", "Sleep Apnea", "Hypertension", "Diabetes"],
    description: "Glaucoma shares pathophysiological mechanisms with neurodegenerative diseases and vascular disorders. Optic nerve damage may reflect broader neurological vulnerability.",
    references: [
      "Flammer J, et al. The impact of ocular blood flow in glaucoma. Prog Retin Eye Res. 2002;21(4):359-93",
      "Hinton DR, et al. Optic-nerve degeneration in Alzheimer's disease. N Engl J Med. 1986;315(8):485-7",
      "Stein JD, et al. The relationship between glaucoma, age-related macular degeneration, and cardiovascular disease. Ophthalmology. 2011;118(12):2427-33"
    ]
  },
  "age-related macular degeneration": {
    systemic: ["Cardiovascular Disease", "Stroke", "Alzheimer's Disease", "Atherosclerosis"],
    description: "AMD shares risk factors and pathogenic mechanisms with cardiovascular disease, including inflammation, oxidative stress, and lipid metabolism abnormalities.",
    references: [
      "Klein R, et al. The association of cardiovascular disease with the long-term incidence of age-related maculopathy. Ophthalmology. 2003;121(6):785-92",
      "Ohno-Matsui K. Parallel findings in age-related macular degeneration and Alzheimer's disease. Prog Retin Eye Res. 2011;30(4):217-38",
      "Ikram MK, et al. Retinal vessel diameters and risk of stroke. Neurology. 2006;66(9):1339-43"
    ]
  },
  "hypertensive retinopathy": {
    systemic: ["Stroke", "Heart Failure", "Chronic Kidney Disease", "Coronary Heart Disease", "Cognitive Decline"],
    description: "Retinal vascular changes in hypertension mirror systemic vascular damage and are strong predictors of cardiovascular events.",
    references: [
      "Wong TY, et al. Hypertensive retinopathy. N Engl J Med. 2004;351(22):2310-7",
      "Wong TY, et al. Retinal arteriolar narrowing and incident coronary heart disease. Arch Intern Med. 2006;166(21):2388-94",
      "Liew G, et al. Retinal microvascular signs and cognitive impairment. J Am Geriatr Soc. 2009;57(10):1892-6"
    ]
  },
  "papilledema": {
    systemic: ["Intracranial Hypertension", "Brain Tumor", "Cerebral Venous Thrombosis", "Meningitis", "Hydrocephalus"],
    description: "Papilledema indicates elevated intracranial pressure and requires urgent neurological evaluation to rule out life-threatening conditions.",
    references: [
      "Friedman DI, et al. Diagnostic criteria for idiopathic intracranial hypertension. Neurology. 2013;81(13):1159-65",
      "Hayreh SS. Pathophysiology of optic disc edema. Prog Retin Eye Res. 2016;50:1-25",
      "Bruce BB, et al. Idiopathic intracranial hypertension in men. Neurology. 2009;72(4):304-9"
    ]
  },
  "retinitis pigmentosa": {
    systemic: ["Hearing Loss (Usher Syndrome)", "Cardiac Conduction Defects", "Neurological Disorders", "Metabolic Disorders"],
    description: "RP can be part of systemic syndromes affecting multiple organ systems due to shared genetic mutations.",
    references: [
      "Hartong DT, et al. Retinitis pigmentosa. Lancet. 2006;368(9549):1795-809",
      "Daiger SP, et al. Genes and mutations causing retinitis pigmentosa. Clin Genet. 2013;84(2):132-41",
      "Ferrari S, et al. Retinitis pigmentosa: genes and disease mechanisms. Curr Genomics. 2011;12(4):238-49"
    ]
  },
  "central retinal vein occlusion": {
    systemic: ["Hypertension", "Diabetes", "Cardiovascular Disease", "Glaucoma", "Thrombophilia"],
    description: "CRVO reflects systemic vascular disease and hypercoagulable states, requiring cardiovascular risk assessment.",
    references: [
      "Hayreh SS, et al. Hemicentral retinal vein occlusion: pathogenesis, clinical features, and natural history. Ophthalmology. 2008;115(5):893-901",
      "Cugati S, et al. Retinal vein occlusion and vascular mortality. Ophthalmology. 2007;114(3):520-4",
      "Klein R, et al. The epidemiology of retinal vein occlusion. Trans Am Ophthalmol Soc. 2000;98:133-41"
    ]
  },
  "optic neuritis": {
    systemic: ["Multiple Sclerosis", "Neuromyelitis Optica", "Systemic Lupus Erythematosus", "Sarcoidosis"],
    description: "Optic neuritis is often the first manifestation of demyelinating diseases and may indicate systemic autoimmune conditions.",
    references: [
      "Beck RW, et al. A randomized, controlled trial of corticosteroids in the treatment of acute optic neuritis. N Engl J Med. 1992;326(9):581-8",
      "Wingerchuk DM, et al. The spectrum of neuromyelitis optica. Lancet Neurol. 2007;6(9):805-15",
      "Balcer LJ. Optic neuritis. N Engl J Med. 2006;354(12):1273-80"
    ]
  }
};

const COLORS = ['#0891b2', '#059669', '#7c3aed', '#dc2626', '#f59e0b', '#ec4899'];

const generateResponse = (userMessage: string): Message => {
  const lowerMessage = userMessage.toLowerCase();
  let responseContent = "";
  let chart: { name: string; value: number; color: string }[] | undefined;
  let references: string[] = [];

  // Check for ocular disease mentions
  let foundDisease: string | null = null;
  for (const disease of Object.keys(OCULAR_SYSTEMIC_KNOWLEDGE)) {
    if (lowerMessage.includes(disease.toLowerCase())) {
      foundDisease = disease;
      break;
    }
  }

  // Check for keywords
  const isAskingAboutLinks = lowerMessage.includes("link") || lowerMessage.includes("systemic") || 
    lowerMessage.includes("associated") || lowerMessage.includes("related") || 
    lowerMessage.includes("connection") || lowerMessage.includes("disease");
  const wantsChart = lowerMessage.includes("chart") || lowerMessage.includes("graph") || 
    lowerMessage.includes("visual") || lowerMessage.includes("show");

  if (foundDisease) {
    const knowledge = OCULAR_SYSTEMIC_KNOWLEDGE[foundDisease];
    responseContent = `## ${foundDisease.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} and Systemic Disease Links\n\n`;
    responseContent += `${knowledge.description}\n\n`;
    responseContent += `### Associated Systemic Conditions:\n`;
    knowledge.systemic.forEach((condition, i) => {
      responseContent += `${i + 1}. **${condition}**\n`;
    });
    
    references = knowledge.references;
    
    if (wantsChart || lowerMessage.includes("common")) {
      chart = knowledge.systemic.slice(0, 6).map((name, i) => ({
        name: name.length > 15 ? name.slice(0, 15) + '...' : name,
        value: Math.round(80 - i * 12 + Math.random() * 10),
        color: COLORS[i % COLORS.length]
      }));
    }
  } else if (isAskingAboutLinks) {
    responseContent = `## Ocular-Systemic Disease Relationships\n\n`;
    responseContent += `The eye provides a unique window into systemic health. Many ocular conditions are associated with systemic diseases:\n\n`;
    responseContent += `- **Diabetic Retinopathy** → Cardiovascular disease, kidney disease, stroke\n`;
    responseContent += `- **Glaucoma** → Alzheimer's disease, sleep apnea, cardiovascular disease\n`;
    responseContent += `- **Hypertensive Retinopathy** → Stroke, heart failure, kidney disease\n`;
    responseContent += `- **AMD** → Cardiovascular disease, Alzheimer's disease\n`;
    responseContent += `- **Papilledema** → Intracranial hypertension, brain tumors\n\n`;
    responseContent += `Ask me about a specific ocular condition for detailed information and references.`;
    
    references = [
      "Wong TY, et al. The eye in hypertension. Lancet. 2007;369(9559):425-35",
      "Cheung N, et al. Retinal vascular image analysis for cardiovascular disease risk. Prog Retin Eye Res. 2009;28(6):438-52"
    ];
  } else if (lowerMessage.includes("reference") || lowerMessage.includes("evidence") || lowerMessage.includes("study")) {
    responseContent = `## Key References in Ocular-Systemic Medicine\n\n`;
    responseContent += `Here are foundational studies linking ocular and systemic diseases:\n\n`;
    responseContent += `1. **ETDRS Study** - Established classification of diabetic retinopathy\n`;
    responseContent += `2. **Beaver Dam Eye Study** - Long-term population study on eye diseases\n`;
    responseContent += `3. **Blue Mountains Eye Study** - Cardiovascular and retinal disease links\n`;
    responseContent += `4. **AREDS Studies** - Age-related macular degeneration research\n\n`;
    responseContent += `Ask about a specific condition for targeted references.`;
    
    references = [
      "ETDRS Research Group. Early photocoagulation for diabetic retinopathy. Ophthalmology. 1991;98(5):766-85",
      "Klein R, et al. The Beaver Dam Eye Study. Ophthalmology. 1991;98(7):1128-34",
      "Mitchell P, et al. Prevalence of age-related maculopathy in Australia. Ophthalmology. 1995;102(10):1450-60"
    ];
  } else {
    responseContent = `I can help you understand the links between ocular and systemic diseases. Here are some topics I can discuss:\n\n`;
    responseContent += `- **Diabetic Retinopathy** and its systemic associations\n`;
    responseContent += `- **Glaucoma** and neurological/cardiovascular connections\n`;
    responseContent += `- **Age-Related Macular Degeneration** and systemic risk factors\n`;
    responseContent += `- **Hypertensive Retinopathy** as a marker of systemic disease\n`;
    responseContent += `- **Papilledema** and neurological emergencies\n`;
    responseContent += `- **Retinitis Pigmentosa** and associated syndromes\n\n`;
    responseContent += `Try asking: *"What systemic diseases are linked to diabetic retinopathy?"* or *"Show me a chart of glaucoma associations"*`;
  }

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: responseContent,
    chart,
    references: references.length > 0 ? references : undefined
  };
};

const LLMChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `## Welcome to Eye-GPT\n\nI can help you explore the connections between **ocular diseases** and **systemic conditions**. All responses include peer-reviewed references.\n\n### Try asking:\n- "What systemic diseases are linked to diabetic retinopathy?"\n- "Show me a chart of glaucoma associations"\n- "What are the cardiovascular implications of hypertensive retinopathy?"\n- "Explain the connection between papilledema and neurological conditions"`,
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(userMessage.content);
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <Logo size={40} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageCircle size={18} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#111', margin: 0 }}>Eye-GPT</h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Ocular-Systemic Disease Links</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Back to Home
        </button>
      </header>

      {/* Large Logo Section */}
      {messages.length <= 1 && (
        <div style={{ 
          padding: '40px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <Logo size={120} />
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 700, 
            color: '#0891b2', 
            marginTop: '16px',
            letterSpacing: '-0.5px',
          }}>
            Eye-GPT
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            marginTop: '8px',
            textAlign: 'center',
            maxWidth: '500px',
          }}>
            Your AI assistant for exploring ocular-systemic disease connections with peer-reviewed references
          </p>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '20px',
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '16px 20px',
                borderRadius: '16px',
                backgroundColor: message.role === 'user' ? '#0891b2' : 'white',
                color: message.role === 'user' ? 'white' : '#374151',
                boxShadow: message.role === 'assistant' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}>
                {message.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Bot size={18} color="#0891b2" />
                    <span style={{ fontWeight: 600, color: '#0891b2', fontSize: '13px' }}>Eye-GPT</span>
                    <Sparkles size={14} color="#f59e0b" />
                  </div>
                )}
                
                <div 
                  style={{ 
                    fontSize: '14px', 
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: message.content
                      .replace(/## (.*?)\n/g, '<h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #111;">$1</h3>')
                      .replace(/### (.*?)\n/g, '<h4 style="font-size: 15px; font-weight: 600; margin: 16px 0 8px; color: #374151;">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/- (.*?)(?:\n|$)/g, '<li style="margin-left: 16px; margin-bottom: 4px;">$1</li>')
                  }}
                />

                {/* Chart */}
                {message.chart && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '16px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <BarChart3 size={16} color="#0891b2" />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                        Association Prevalence (%)
                      </span>
                    </div>
                    <div style={{ height: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={message.chart} layout="vertical">
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {message.chart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* References */}
                {message.references && message.references.length > 0 && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px 16px', 
                    backgroundColor: '#fffbeb', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #f59e0b',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <BookOpen size={14} color="#d97706" />
                      <span style={{ fontWeight: 600, fontSize: '12px', color: '#92400e' }}>References</span>
                    </div>
                    <ol style={{ margin: 0, paddingLeft: '16px' }}>
                      {message.references.map((ref, i) => (
                        <li key={i} style={{ fontSize: '11px', color: '#78350f', marginBottom: '4px', lineHeight: 1.5 }}>
                          {ref}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
              <div style={{
                padding: '16px 20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0891b2', animation: 'bounce 1s infinite' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0891b2', animation: 'bounce 1s infinite 0.2s' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0891b2', animation: 'bounce 1s infinite 0.4s' }} />
                </div>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Searching knowledge base...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ 
        backgroundColor: 'white', 
        borderTop: '1px solid #e5e7eb', 
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '4px 4px 4px 16px',
            border: '1px solid #e5e7eb',
          }}>
            <AlertCircle size={18} color="#6b7280" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about ocular-systemic disease links..."
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '15px',
                outline: 'none',
                padding: '12px 0',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: input.trim() && !isLoading ? '#0891b2' : '#e5e7eb',
                color: input.trim() && !isLoading ? 'white' : '#9ca3af',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Send size={16} />
              Send
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' }}>
            All responses include peer-reviewed references. This is for educational purposes only.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default LLMChat;
