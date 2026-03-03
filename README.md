# AI Receipt Splitter 🧾✨

An intelligent, split-screen web application that makes splitting bills with friends effortless. Powered by Google's Gemini 3.1 Pro multimodal AI, this app automatically parses physical receipts and allows users to assign costs using natural language chat.

## ✨ Features

- **📸 Smart Receipt Parsing**: Upload an image of your receipt (PNG, JPG, WEBP), and the AI will automatically extract all line items, prices, subtotal, tax, and tip.
- **💬 Natural Language Assignment**: No more tedious manual entry. Simply chat with the AI assistant (e.g., "Dhruv had the nachos" or "Sarah and Sue shared the pizza"), and it will automatically assign the items to the right people.
- **📊 Real-Time Summary**: As you chat, the left pane instantly updates to show exactly who owes what. Tax and tip are automatically and proportionally distributed based on each person's share of the assigned items.
- **🌍 Multi-Language Support**: Fully localized in 7 languages: English, Simplified Chinese, Japanese, Korean, Spanish, German, and French. The AI assistant will seamlessly respond in your selected language.
- **💱 Auto-Currency Detection**: The app automatically detects the currency symbol used on the receipt ($, ¥, €, £, ₩) and updates the entire interface accordingly.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK (`@google/genai`) using the `gemini-3.1-pro-preview` model for both vision (receipt parsing) and function calling (chat assignments).

---

# AI 智能账单平摊助手 🧾✨

一款智能的左右分屏 Web 应用，让与朋友分摊账单变得轻松无比。本项目由 Google 的 Gemini 3.1 Pro 多模态 AI 驱动，能够自动解析实体小票，并允许用户通过自然语言聊天来分配费用。

## ✨ 核心功能

- **📸 智能小票解析**：上传您的收据图片（支持 PNG、JPG、WEBP 格式），AI 将自动提取所有消费明细、价格、小计、税费和小费。
- **💬 自然语言分配**：告别繁琐的手动输入。只需与 AI 助手聊天（例如：“张三吃了烤肉” 或 “李四和王五平分了披萨”），它就会自动将项目分配给对应的人。
- **📊 实时分摊汇总**：在您聊天的同时，左侧面板会实时更新，清晰展示每个人应付的金额。税费和小费会根据每个人所点项目的比例自动进行公平分摊。
- **🌍 多语言支持**：全面支持 7 种语言：英语、简体中文、日语、韩语、西班牙语、德语和法语。AI 助手会无缝使用您选择的语言进行回复。
- **💱 货币自动检测**：应用会自动识别小票上使用的货币符号（如 $, ¥, €, £, ₩），并相应地更新整个界面的金额显示。

## 🛠️ 技术栈

- **前端框架**：React 19, TypeScript, Tailwind CSS, Vite
- **图标库**：Lucide React
- **AI 集成**：Google GenAI SDK (`@google/genai`)，使用 `gemini-3.1-pro-preview` 模型同时处理视觉任务（小票解析）和函数调用任务（聊天分配）。
