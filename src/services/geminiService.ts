import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { ReceiptData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'de' | 'fr';

const languageMap: Record<Language, string> = {
  en: 'English',
  zh: 'Simplified Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  de: 'German',
  fr: 'French'
};

export const parseReceipt = async (base64Image: string, mimeType: string, language: Language = 'en'): Promise<ReceiptData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        inlineData: {
          data: base64Image,
          mimeType,
        }
      },
      {
        text: 'Parse this receipt. Extract all line items with their prices in their original language. Also extract the subtotal, tax, tip, and total. Generate a unique string ID for each item. Do not include tax, tip, or subtotal in the items list. Also detect the currency symbol used in the receipt (e.g., $, ¥, €, £, ₩). If you cannot detect it, return "$".'
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                price: { type: Type.NUMBER }
              },
              required: ['id', 'name', 'price']
            }
          },
          subtotal: { type: Type.NUMBER },
          tax: { type: Type.NUMBER },
          tip: { type: Type.NUMBER },
          total: { type: Type.NUMBER },
          currency: { type: Type.STRING, description: 'The currency symbol detected on the receipt, e.g., $, ¥, €, £, ₩. Default to $ if unknown.' }
        },
        required: ['items', 'subtotal', 'tax', 'tip', 'total', 'currency']
      }
    }
  });

  const parsed = JSON.parse(response.text!) as any;
  
  return {
    ...parsed,
    items: parsed.items.map((item: any) => ({
      ...item,
      assignedTo: []
    }))
  };
};

export const updateAssignmentsDeclaration: FunctionDeclaration = {
  name: 'updateAssignments',
  description: 'Update who is assigned to pay for specific items on the receipt.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      updates: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            itemId: { type: Type.STRING, description: 'The ID of the item' },
            assignedTo: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of names of people sharing this item'
            }
          },
          required: ['itemId', 'assignedTo']
        }
      }
    },
    required: ['updates']
  }
};

export const updateTaxAndTipDeclaration: FunctionDeclaration = {
  name: 'updateTaxAndTip',
  description: 'Update the tax or tip amount for the receipt.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      tax: { type: Type.NUMBER, description: 'The new tax amount' },
      tip: { type: Type.NUMBER, description: 'The new tip amount' }
    }
  }
};

export const getChatResponse = async (
  message: string,
  history: any[],
  receiptState: ReceiptData,
  language: Language
) => {
  const systemInstruction = `You are a helpful assistant helping users split a bill.
Current Receipt State:
${JSON.stringify(receiptState, null, 2)}

When the user tells you who had what, use the updateAssignments tool to assign items to people. Use the exact itemId from the current state.
If the user mentions a new person, just include their name.
If the user wants to split an item among multiple people, include all their names.
If the user updates tax or tip, use the updateTaxAndTip tool.
Always respond with a friendly confirmation of what you did. Keep responses concise.
IMPORTANT: You must reply in ${languageMap[language]}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [updateAssignmentsDeclaration, updateTaxAndTipDeclaration] }]
    }
  });

  return response;
};

export const sendFunctionResponse = async (
  message: string,
  history: any[],
  modelResponse: any,
  functionResponses: any[],
  receiptState: ReceiptData,
  language: Language
) => {
  const systemInstruction = `You are a helpful assistant helping users split a bill.
Current Receipt State:
${JSON.stringify(receiptState, null, 2)}

Always respond with a friendly confirmation of what you did. Keep responses concise.
IMPORTANT: You must reply in ${languageMap[language]}.`;

  const functionResponseParts = functionResponses.map(fr => ({
    functionResponse: {
      name: fr.name,
      response: fr.response
    }
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] },
      modelResponse,
      { role: 'user', parts: functionResponseParts }
    ],
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [updateAssignmentsDeclaration, updateTaxAndTipDeclaration] }]
    }
  });

  return response;
};
