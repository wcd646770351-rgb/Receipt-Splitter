export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
};

export type ReceiptData = {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  currency: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  text: string;
};
