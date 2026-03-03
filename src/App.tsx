import React, { useState, useRef, useEffect } from 'react';
import { Upload, Receipt, MessageSquare, Send, Loader2, Users, Globe, DollarSign } from 'lucide-react';
import { parseReceipt, getChatResponse, sendFunctionResponse, Language } from './services/geminiService';
import { ReceiptData, ChatMessage } from './types';

const translations = {
  en: {
    title: "Receipt Splitter",
    leftPaneTitle: "Receipt Analysis",
    startOver: "Start Over",
    uploadPrompt: "Upload a receipt",
    uploadSub: "PNG, JPG, or WEBP",
    analyzing: "Analyzing receipt...",
    extracting: "Extracting items and prices",
    lineItems: "Line Items",
    unassigned: "Unassigned",
    subtotal: "Subtotal",
    tax: "Tax",
    tip: "Tip",
    total: "Total",
    whoOwesWhat: "Who Owes What",
    includesTaxTip: "Includes tax & tip",
    assignPrompt: "Assign items in the chat to see the summary.",
    assistantTitle: "Split Assistant",
    uploadFirst: "Upload a receipt to start splitting the bill.",
    updating: "Updating...",
    chatPlaceholder: "e.g., Dhruv had the nachos...",
    chatPlaceholderEmpty: "Upload a receipt first...",
    welcomeMessage: "I've parsed the receipt! Who had what? (e.g., 'Dhruv had the nachos')",
    errorMessage: "Sorry, I encountered an error. Please try again.",
    doneMessage: "Done!",
    language: "Language",
    currency: "Currency"
  },
  zh: {
    title: "账单平摊助手",
    leftPaneTitle: "账单分析",
    startOver: "重新开始",
    uploadPrompt: "上传小票",
    uploadSub: "支持 PNG, JPG, 或 WEBP",
    analyzing: "正在分析小票...",
    extracting: "提取项目和价格中",
    lineItems: "消费明细",
    unassigned: "未分配",
    subtotal: "小计",
    tax: "税费",
    tip: "小费",
    total: "总计",
    whoOwesWhat: "分摊明细",
    includesTaxTip: "包含税费和小费",
    assignPrompt: "在聊天中分配项目以查看汇总。",
    assistantTitle: "分摊助手（提供具体点单信息）",
    uploadFirst: "请先上传小票以开始分摊。",
    updating: "更新中...",
    chatPlaceholder: "例如：张三吃了烤肉...",
    chatPlaceholderEmpty: "请先上传小票...",
    welcomeMessage: "我已经解析了小票！谁吃了什么？（例如：'张三吃了烤肉'）",
    errorMessage: "抱歉，我遇到了一些错误，请重试。",
    doneMessage: "完成！",
    language: "语言",
    currency: "货币"
  },
  ja: {
    title: "割り勘アシスタント",
    leftPaneTitle: "レシート分析",
    startOver: "最初からやり直す",
    uploadPrompt: "レシートをアップロード",
    uploadSub: "PNG、JPG、またはWEBP",
    analyzing: "レシートを分析中...",
    extracting: "品目と価格を抽出中",
    lineItems: "品目",
    unassigned: "未割り当て",
    subtotal: "小計",
    tax: "税金",
    tip: "チップ",
    total: "合計",
    whoOwesWhat: "支払い内訳",
    includesTaxTip: "税金とチップを含む",
    assignPrompt: "チャットで品目を割り当てると、ここに概要が表示されます。",
    assistantTitle: "割り勘アシスタント",
    uploadFirst: "割り勘を始めるには、まずレシートをアップロードしてください。",
    updating: "更新中...",
    chatPlaceholder: "例：太郎がナチョスを食べた...",
    chatPlaceholderEmpty: "まずはレシートをアップロードしてください...",
    welcomeMessage: "レシートの解析が完了しました！誰が何を食べましたか？（例：「太郎がナチョスを食べた」）",
    errorMessage: "申し訳ありません、エラーが発生しました。もう一度お試しください。",
    doneMessage: "完了しました！",
    language: "言語",
    currency: "通貨"
  },
  ko: {
    title: "더치페이 도우미",
    leftPaneTitle: "영수증 분석",
    startOver: "다시 시작",
    uploadPrompt: "영수증 업로드",
    uploadSub: "PNG, JPG, 또는 WEBP",
    analyzing: "영수증 분석 중...",
    extracting: "항목 및 가격 추출 중",
    lineItems: "항목",
    unassigned: "미할당",
    subtotal: "소계",
    tax: "세금",
    tip: "팁",
    total: "총액",
    whoOwesWhat: "결제 내역",
    includesTaxTip: "세금 및 팁 포함",
    assignPrompt: "채팅에서 항목을 할당하면 여기에 요약이 표시됩니다.",
    assistantTitle: "더치페이 도우미",
    uploadFirst: "더치페이를 시작하려면 먼저 영수증을 업로드하세요.",
    updating: "업데이트 중...",
    chatPlaceholder: "예: 지훈이가 나초를 먹었어...",
    chatPlaceholderEmpty: "먼저 영수증을 업로드하세요...",
    welcomeMessage: "영수증 분석을 완료했습니다! 누가 무엇을 먹었나요? (예: '지훈이가 나초를 먹었어')",
    errorMessage: "죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.",
    doneMessage: "완료되었습니다!",
    language: "언어",
    currency: "통화"
  },
  es: {
    title: "Asistente de Cuentas",
    leftPaneTitle: "Análisis de Recibo",
    startOver: "Empezar de nuevo",
    uploadPrompt: "Subir un recibo",
    uploadSub: "PNG, JPG, o WEBP",
    analyzing: "Analizando recibo...",
    extracting: "Extrayendo artículos y precios",
    lineItems: "Artículos",
    unassigned: "Sin asignar",
    subtotal: "Subtotal",
    tax: "Impuesto",
    tip: "Propina",
    total: "Total",
    whoOwesWhat: "Quién debe qué",
    includesTaxTip: "Incluye impuesto y propina",
    assignPrompt: "Asigna artículos en el chat para ver el resumen.",
    assistantTitle: "Asistente de Cuentas",
    uploadFirst: "Sube un recibo para empezar a dividir la cuenta.",
    updating: "Actualizando...",
    chatPlaceholder: "ej., Carlos comió los nachos...",
    chatPlaceholderEmpty: "Sube un recibo primero...",
    welcomeMessage: "¡He analizado el recibo! ¿Quién comió qué? (ej., 'Carlos comió los nachos')",
    errorMessage: "Lo siento, encontré un error. Por favor, inténtalo de nuevo.",
    doneMessage: "¡Hecho!",
    language: "Idioma",
    currency: "Moneda"
  },
  de: {
    title: "Rechnungsteiler",
    leftPaneTitle: "Rechnungsanalyse",
    startOver: "Neu starten",
    uploadPrompt: "Quittung hochladen",
    uploadSub: "PNG, JPG, oder WEBP",
    analyzing: "Quittung wird analysiert...",
    extracting: "Artikel und Preise werden extrahiert",
    lineItems: "Artikel",
    unassigned: "Nicht zugewiesen",
    subtotal: "Zwischensumme",
    tax: "Steuer",
    tip: "Trinkgeld",
    total: "Gesamt",
    whoOwesWhat: "Wer schuldet was",
    includesTaxTip: "Inklusive Steuer & Trinkgeld",
    assignPrompt: "Weisen Sie Artikel im Chat zu, um die Zusammenfassung zu sehen.",
    assistantTitle: "Rechnungsteiler",
    uploadFirst: "Laden Sie eine Quittung hoch, um die Rechnung zu teilen.",
    updating: "Aktualisiere...",
    chatPlaceholder: "z.B., Max hatte die Nachos...",
    chatPlaceholderEmpty: "Zuerst Quittung hochladen...",
    welcomeMessage: "Ich habe die Quittung analysiert! Wer hatte was? (z.B. 'Max hatte die Nachos')",
    errorMessage: "Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    doneMessage: "Erledigt!",
    language: "Sprache",
    currency: "Währung"
  },
  fr: {
    title: "Partage d'Addition",
    leftPaneTitle: "Analyse du Reçu",
    startOver: "Recommencer",
    uploadPrompt: "Télécharger un reçu",
    uploadSub: "PNG, JPG, ou WEBP",
    analyzing: "Analyse du reçu...",
    extracting: "Extraction des articles et des prix",
    lineItems: "Articles",
    unassigned: "Non assigné",
    subtotal: "Sous-total",
    tax: "Taxe",
    tip: "Pourboire",
    total: "Total",
    whoOwesWhat: "Qui doit quoi",
    includesTaxTip: "Inclut la taxe et le pourboire",
    assignPrompt: "Attribuez des articles dans le chat pour voir le résumé.",
    assistantTitle: "Assistant de Partage",
    uploadFirst: "Téléchargez un reçu pour commencer à partager l'addition.",
    updating: "Mise à jour...",
    chatPlaceholder: "ex., Jean a pris les nachos...",
    chatPlaceholderEmpty: "Téléchargez d'abord un reçu...",
    welcomeMessage: "J'ai analysé le reçu ! Qui a pris quoi ? (ex., 'Jean a pris les nachos')",
    errorMessage: "Désolé, j'ai rencontré une erreur. Veuillez réessayer.",
    doneMessage: "Terminé !",
    language: "Langue",
    currency: "Devise"
  }
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState('$');
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const parsedData = await parseReceipt(base64String, file.type, language);
        setReceiptData(parsedData);
        
        // Auto-detect currency
        if (parsedData.currency) {
          const supportedCurrencies = ['$', '¥', '€', '£', '₩'];
          if (supportedCurrencies.includes(parsedData.currency)) {
            setCurrency(parsedData.currency);
          } else {
            setCurrency('$');
          }
        }

        setChatHistory([{
          id: 'welcome',
          role: 'model',
          text: t.welcomeMessage
        }]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to parse receipt:', error);
      alert(t.errorMessage);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !receiptData) return;

    const userText = chatInput.trim();
    setChatInput('');
    
    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    setChatHistory(prev => [...prev, newUserMsg]);
    setIsChatting(true);

    try {
      const response = await getChatResponse(userText, geminiHistory, receiptData, language);
      
      let finalResponseText = response.text;
      let newReceiptData = { ...receiptData };
      let functionCalled = false;

      if (response.functionCalls && response.functionCalls.length > 0) {
        functionCalled = true;
        const functionResponses: any[] = [];
        
        for (const call of response.functionCalls) {
          if (call.name === 'updateAssignments') {
            const args = call.args as any;
            if (args.updates) {
              args.updates.forEach((update: any) => {
                const itemIndex = newReceiptData.items.findIndex(i => i.id === update.itemId);
                if (itemIndex !== -1) {
                  newReceiptData.items[itemIndex].assignedTo = update.assignedTo;
                }
              });
            }
            functionResponses.push({ name: call.name, response: { result: 'success' } });
          } else if (call.name === 'updateTaxAndTip') {
            const args = call.args as any;
            if (args.tax !== undefined) newReceiptData.tax = args.tax;
            if (args.tip !== undefined) newReceiptData.tip = args.tip;
            functionResponses.push({ name: call.name, response: { result: 'success' } });
          }
        }

        setReceiptData(newReceiptData);

        const finalResponse = await sendFunctionResponse(
          userText,
          geminiHistory,
          response.candidates?.[0]?.content,
          functionResponses,
          newReceiptData,
          language
        );
        
        finalResponseText = finalResponse.text;
      }

      const newModelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: finalResponseText || t.doneMessage };
      setChatHistory(prev => [...prev, newModelMsg]);

      setGeminiHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userText }] },
        { role: 'model', parts: [{ text: finalResponseText || t.doneMessage }] }
      ]);

    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'model', text: t.errorMessage }]);
    } finally {
      setIsChatting(false);
    }
  };

  const calculateSummary = (data: ReceiptData) => {
    const personTotals: Record<string, { items: number }> = {};
    
    data.items.forEach(item => {
      if (item.assignedTo.length > 0) {
        const splitPrice = item.price / item.assignedTo.length;
        item.assignedTo.forEach(person => {
          if (!personTotals[person]) personTotals[person] = { items: 0 };
          personTotals[person].items += splitPrice;
        });
      }
    });

    const summary = Object.entries(personTotals).map(([person, totals]) => {
      const share = data.subtotal > 0 ? totals.items / data.subtotal : 0;
      const taxShare = data.tax * share;
      const tipShare = data.tip * share;
      
      return {
        person,
        items: totals.items,
        tax: taxShare,
        tip: tipShare,
        total: totals.items + taxShare + tipShare
      };
    });

    return summary.sort((a, b) => b.total - a.total);
  };

  const reset = () => {
    setReceiptData(null);
    setChatHistory([]);
    setGeminiHistory([]);
  };

  return (
    <div className="flex flex-col h-screen bg-stone-100 text-stone-900 font-sans">
      {/* Global Header */}
      <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Receipt className="w-5 h-5 text-emerald-600" />
          {t.title}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-stone-500" />
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
              className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-1.5 outline-none cursor-pointer"
            >
              <option value="$">USD ($)</option>
              <option value="¥">CNY/JPY (¥)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="₩">KRW (₩)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-500" />
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value as Language)}
              className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-1.5 outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Receipt & Summary */}
        <div className="w-1/2 h-full border-r border-stone-200 flex flex-col bg-white overflow-hidden">
          <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {t.leftPaneTitle}
            </h1>
            {receiptData && (
              <button onClick={reset} className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                {t.startOver}
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {!receiptData && !isParsing ? (
              <div className="h-full flex flex-col items-center justify-center">
                <label className="flex flex-col items-center justify-center w-full max-w-md aspect-video border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer p-8 text-center">
                  <Upload className="w-10 h-10 text-stone-400 mb-4" />
                  <span className="text-stone-600 font-medium mb-1">{t.uploadPrompt}</span>
                  <span className="text-stone-400 text-sm">{t.uploadSub}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            ) : isParsing ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-600" />
                <p className="font-medium">{t.analyzing}</p>
                <p className="text-sm text-stone-400 mt-2">{t.extracting}</p>
              </div>
            ) : receiptData ? (
              <div className="space-y-8 max-w-lg mx-auto pb-8">
                {/* Items List */}
                <div>
                  <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">{t.lineItems}</h2>
                  <div className="space-y-3">
                    {receiptData.items.map(item => (
                      <div key={item.id} className="flex flex-col p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-medium text-stone-800">{item.name}</span>
                          <span className="font-mono text-stone-600">{currency}{item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.assignedTo.length > 0 ? (
                            item.assignedTo.map(person => (
                              <span key={person} className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                                {person}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 border border-stone-200 text-xs">
                              {t.unassigned}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Totals */}
                <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 space-y-3">
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>{t.subtotal}</span>
                    <span className="font-mono">{currency}{receiptData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>{t.tax}</span>
                    <span className="font-mono">{currency}{receiptData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>{t.tip}</span>
                    <span className="font-mono">{currency}{receiptData.tip.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t border-stone-200 text-stone-900">
                    <span>{t.total}</span>
                    <span className="font-mono">{currency}{receiptData.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Summary per person */}
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                  <h2 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t.whoOwesWhat}
                  </h2>
                  <div className="space-y-4">
                    {calculateSummary(receiptData).map(summary => (
                      <div key={summary.person} className="flex justify-between items-center bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                        <span className="font-medium text-indigo-950">{summary.person}</span>
                        <div className="text-right">
                          <div className="font-mono font-bold text-indigo-700">{currency}{summary.total.toFixed(2)}</div>
                          <div className="text-[10px] text-indigo-400 uppercase tracking-wider mt-0.5">
                            {t.includesTaxTip}
                          </div>
                        </div>
                      </div>
                    ))}
                    {calculateSummary(receiptData).length === 0 && (
                      <p className="text-sm text-indigo-400 italic text-center py-2">{t.assignPrompt}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Pane: Chat */}
        <div className="w-1/2 h-full flex flex-col bg-white">
          <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-medium">{t.assistantTitle}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.length === 0 && !isChatting && (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center max-w-sm mx-auto">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p>{t.uploadFirst}</p>
              </div>
            )}
            {chatHistory.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm' 
                    : 'bg-stone-100 text-stone-800 rounded-bl-sm border border-stone-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatting && (
              <div className="flex justify-start">
                <div className="bg-stone-100 text-stone-800 rounded-2xl rounded-bl-sm px-5 py-3.5 flex items-center gap-3 border border-stone-200">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm font-medium text-stone-500">{t.updating}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t border-stone-200 bg-stone-50">
            <form onSubmit={handleChatSubmit} className="flex gap-2 relative max-w-3xl mx-auto">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={receiptData ? t.chatPlaceholder : t.chatPlaceholderEmpty}
                disabled={!receiptData || isChatting}
                className="flex-1 rounded-full border border-stone-300 bg-white px-5 py-3.5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-stone-100 disabled:text-stone-400 shadow-sm"
              />
              <button 
                type="submit"
                disabled={!receiptData || isChatting || !chatInput.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-stone-300 disabled:text-stone-500 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
