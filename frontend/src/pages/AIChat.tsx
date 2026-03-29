import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Calculator,
  FlaskConical,
  History,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  { icon: Calculator, text: "Explain quadratic equations step by step" },
  { icon: FlaskConical, text: "What is chemical bonding?" },
  { icon: BookOpen, text: "Help me understand Newton's laws of motion" },
  { icon: History, text: "Summarize World War II causes" },
];

const sampleResponses: Record<string, string> = {
  default: `I'm your AI tutor, ready to help you learn! I have access to your course materials, assignments, and can explain concepts at a Grade 9-10 level.

**What I can help with:**
- 📚 Explaining concepts step by step
- ✍️ Practice questions & exercises
- 📝 Assignment help (without giving direct answers)
- 🔄 Revision summaries

What would you like to learn about today?`,
  quadratic: `# Quadratic Equations 📐

A **quadratic equation** is a polynomial equation of the second degree, meaning the highest power of the variable is 2.

## Standard Form
\`ax² + bx + c = 0\`

Where:
- **a**, **b**, and **c** are constants (a ≠ 0)
- **x** is the variable we're solving for

## Methods to Solve

### 1. Factoring
Find two numbers that multiply to give \`ac\` and add to give \`b\`.

### 2. Quadratic Formula
\`x = (-b ± √(b² - 4ac)) / 2a\`

### 3. Completing the Square
Rewrite the equation in the form \`(x + p)² = q\`

---

**Would you like me to:**
- Work through a specific example?
- Give you practice problems?
- Explain any method in more detail?`,
  newton: `# Newton's Laws of Motion 🍎

Sir Isaac Newton formulated three fundamental laws that describe how objects move.

## First Law (Law of Inertia)
> An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction, unless acted upon by an external force.

**Example:** A book on a table stays there until you push it.

## Second Law (F = ma)
> Force equals mass times acceleration.

\`F = m × a\`

**Example:** Pushing a shopping cart - the harder you push (more force), the faster it accelerates.

## Third Law (Action-Reaction)
> For every action, there is an equal and opposite reaction.

**Example:** When you jump, you push down on the ground, and the ground pushes you up.

---

**Practice Question:** A 5 kg object accelerates at 3 m/s². What force is acting on it?

Would you like me to explain more or try some practice problems?`,
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: sampleResponses.default,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message?: string) => {
    const text = message || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response = sampleResponses.default;
      if (text.toLowerCase().includes("quadratic")) {
        response = sampleResponses.quadratic;
      } else if (text.toLowerCase().includes("newton") || text.toLowerCase().includes("motion")) {
        response = sampleResponses.newton;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <DashboardLayout role="student" title="AI Tutor">
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 pb-4 border-b border-border mb-4"
        >
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              EduTrack AI Tutor
              <Sparkles className="h-4 w-4 text-accent" />
            </h2>
            <p className="text-sm text-muted-foreground">
              Your personal learning assistant • Grade 9-10 curriculum
            </p>
          </div>
        </motion.div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] ${
                      message.role === "user"
                        ? "chat-bubble-user"
                        : "chat-bubble-ai prose prose-sm max-w-none"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mb-2">$1</h1>')
                            .replace(/^## (.*$)/gim, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
                            .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold mt-2 mb-1">$1</h3>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
                            .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-primary pl-3 my-2 italic">$1</blockquote>')
                            .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
                            .replace(/---/g, '<hr class="my-3 border-border" />')
                            .replace(/\n/g, '<br />'),
                        }}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="chat-bubble-ai flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggested questions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => handleSend(q.text)}
                >
                  <q.icon className="h-4 w-4 mr-2 shrink-0 text-primary" />
                  <span className="text-sm">{q.text}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="pt-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your courses..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI Tutor provides explanations based on your curriculum. Always verify important information with your teacher.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
