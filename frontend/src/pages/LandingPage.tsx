import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  MessageSquare,
  Video,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  ClipboardList,
  Star,
  Users,
  Target,
  Brain,
  Trophy,
  Clock,
  FileText,
  Calculator,
  Atom,
  Microscope,
  ChevronRight,
  Play,
  Download,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const floatingFormulas = [
  { formula: "E = mc²", x: "10%", y: "20%", delay: 0, size: "text-2xl" },
  { formula: "F = ma", x: "85%", y: "15%", delay: 0.5, size: "text-xl" },
  { formula: "∫ f(x)dx", x: "5%", y: "60%", delay: 1, size: "text-lg" },
  { formula: "x = (-b ± √(b²-4ac)) / 2a", x: "75%", y: "70%", delay: 0.3, size: "text-sm" },
  { formula: "sin²θ + cos²θ = 1", x: "80%", y: "40%", delay: 0.8, size: "text-base" },
  { formula: "a² + b² = c²", x: "15%", y: "80%", delay: 1.2, size: "text-xl" },
  { formula: "V = IR", x: "90%", y: "85%", delay: 0.6, size: "text-lg" },
  { formula: "PV = nRT", x: "3%", y: "40%", delay: 1.5, size: "text-base" },
];

const heroHighlights = [
  { icon: BookOpen, text: "CBSE-Aligned" },
  { icon: FileText, text: "NCERT-Based" },
  { icon: Video, text: "Live + Recorded" },
  { icon: Brain, text: "AI Doubt Support" },
  { icon: ClipboardList, text: "Chapter-wise Tests" },
  { icon: BarChart3, text: "Progress Tracking" },
  { icon: Target, text: "Board Exam Prep" },
];

const whyEduTrack = [
  { icon: Target, title: "Only CBSE Class 9 & 10", desc: "No distractions. We focus exclusively on what matters for your board success." },
  { icon: BookOpen, title: "NCERT-First Approach", desc: "Every lesson starts from NCERT textbooks — the foundation of CBSE exams." },
  { icon: Brain, title: "AI-Powered Doubt Solving", desc: "Get step-by-step solutions instantly. Ask any doubt, anytime." },
  { icon: BarChart3, title: "Track Every Chapter", desc: "See exactly where you stand with chapter-level progress tracking." },
  { icon: Shield, title: "Safe & Parent-Friendly", desc: "Parents can track progress, see reports, and stay informed." },
  { icon: Zap, title: "Concept Clarity First", desc: "Understand first, score next. Visual explanations that actually make sense." },
];

const class9Subjects = [
  { icon: Calculator, title: "Mathematics", chapters: 15, desc: "Number Systems, Polynomials, Geometry, Statistics & more" },
  { icon: Atom, title: "Physics", chapters: 5, desc: "Motion, Force, Gravitation, Work & Energy, Sound" },
  { icon: Sparkles, title: "Chemistry", chapters: 4, desc: "Matter, Atoms & Molecules, Structure of the Atom" },
  { icon: Microscope, title: "Biology", chapters: 6, desc: "Cell, Tissues, Diversity, Health, Natural Resources" },
];

const class10Subjects = [
  { icon: Calculator, title: "Mathematics", chapters: 14, desc: "Real Numbers, Quadratic Equations, Trigonometry & more" },
  { icon: Atom, title: "Physics", chapters: 5, desc: "Light, Electricity, Magnetism, Sources of Energy" },
  { icon: Sparkles, title: "Chemistry", chapters: 5, desc: "Chemical Reactions, Acids & Bases, Carbon Compounds" },
  { icon: Microscope, title: "Biology", chapters: 6, desc: "Life Processes, Reproduction, Heredity, Environment" },
];

const featuredChapters = [
  { subject: "Mathematics", chapter: "Quadratic Equations", class: "10", formula: "x = (-b ± √(b²-4ac)) / 2a", difficulty: "Medium" },
  { subject: "Physics", chapter: "Light – Reflection & Refraction", class: "10", formula: "1/f = 1/v - 1/u", difficulty: "Medium" },
  { subject: "Chemistry", chapter: "Chemical Reactions", class: "10", formula: "2Mg + O₂ → 2MgO", difficulty: "Easy" },
  { subject: "Mathematics", chapter: "Triangles", class: "9", formula: "a² + b² = c²", difficulty: "Medium" },
  { subject: "Physics", chapter: "Force & Laws of Motion", class: "9", formula: "F = ma", difficulty: "Easy" },
  { subject: "Biology", chapter: "Life Processes", class: "10", formula: "6CO₂ + 6H₂O → C₆H₁₂O₆", difficulty: "Medium" },
];

const howItWorks = [
  { step: "1", title: "Choose Your Class", desc: "Select Class 9 or Class 10 and pick your subject." },
  { step: "2", title: "Learn Chapter-wise", desc: "Watch video lessons, read notes, and understand concepts clearly." },
  { step: "3", title: "Practice & Test", desc: "Solve NCERT exercises, take chapter tests, and track your scores." },
  { step: "4", title: "Ask AI for Help", desc: "Stuck on a problem? Our AI tutor gives step-by-step solutions instantly." },
  { step: "5", title: "Master & Score", desc: "Complete all chapters, revise smartly, and ace your CBSE exams." },
];

const sampleProblems = [
  {
    subject: "Mathematics",
    topic: "Quadratic Equations",
    problem: "Solve: x² - 5x + 6 = 0",
    solution: "x = 2 or x = 3",
    steps: ["Factor: (x-2)(x-3) = 0", "x - 2 = 0 → x = 2", "x - 3 = 0 → x = 3"],
  },
  {
    subject: "Physics",
    topic: "Newton's Second Law",
    problem: "A 10kg object accelerates at 5m/s². Find the force.",
    solution: "F = 50 N",
    steps: ["F = m × a", "F = 10 kg × 5 m/s²", "F = 50 N"],
  },
  {
    subject: "Chemistry",
    topic: "Balancing Equations",
    problem: "Balance: Fe + O₂ → Fe₂O₃",
    solution: "4Fe + 3O₂ → 2Fe₂O₃",
    steps: ["Count Fe: 1 → 2", "Count O: 2 → 3", "4Fe + 3O₂ → 2Fe₂O₃"],
  },
];

const teachers = [
  {
    name: "Aparna Debnath",
    role: "Senior Science Faculty",
    focus: "CBSE Class 9 & 10 Science",
    bio: "Aparna Debnath helps students understand science concepts in a simple, structured, and practical way. Her teaching approach focuses on concept clarity, chapter-wise understanding, diagrams, and exam-oriented preparation.",
    tags: ["Concept Clarity", "Visual Learning", "Exam Preparation", "Doubt Support"],
  },
  {
    name: "Krishna Pada Debnath",
    role: "Senior Mathematics Faculty",
    focus: "CBSE Class 9 & 10 Mathematics",
    bio: "Krishna Pada Debnath focuses on building strong mathematical fundamentals through step-by-step problem solving, regular practice, and clear explanation of formulas and methods.",
    tags: ["Step-by-Step Solving", "Fundamentals First", "Practice Focused", "Board Ready"],
  },
];


const testimonials = [
  { name: "Aarav S.", class: "Class 10", text: "EduTrack Pro made Trigonometry so easy! The step-by-step videos and AI tutor helped me score 95 in Maths.", rating: 5 },
  { name: "Priya M.", class: "Class 9", text: "I love how everything is chapter-wise. No confusion, just clean learning. Science is now my favourite subject!", rating: 5 },
  { name: "Ravi K.", class: "Parent", text: "As a parent, I can see my son's progress clearly. The reports and tracking give me confidence in his learning.", rating: 5 },
  { name: "Sneha D.", class: "Class 10", text: "The AI doubt solver is amazing. I got stuck on Quadratic Equations and it explained everything step by step.", rating: 5 },
];

const faqs = [
  { q: "Is EduTrack Pro only for CBSE students?", a: "Yes, we focus exclusively on CBSE Class 9 and Class 10 students, covering Mathematics and Science in depth aligned with the NCERT syllabus." },
  { q: "How does the AI doubt support work?", a: "Our AI tutor understands your CBSE curriculum. Simply type or ask your doubt, and it provides step-by-step explanations, formulas, and practice problems instantly." },
  { q: "Can parents track their child's progress?", a: "Absolutely! Parents get access to progress reports, test scores, chapter completion status, and time-spent analytics through a dedicated parent dashboard." },
  { q: "Are the classes live or recorded?", a: "We offer both! Live interactive classes for real-time learning and a full recorded library you can access anytime for revision." },
  { q: "What is the refund policy?", a: "We offer a 7-day free trial. If you're not satisfied with any paid plan, you can request a full refund within 7 days of purchase." },
  { q: "Do you cover board exam preparation specifically?", a: "Yes! We have dedicated board exam prep modules including previous year question practice, assertion-reason questions, case-based questions, and full mock tests." },
];

const comparisonPoints = [
  { feature: "Focus", us: "Only Class 9 & 10", others: "All grades K-12" },
  { feature: "Subject Depth", us: "Deep Math & Science", others: "Broad, surface-level" },
  { feature: "Content Alignment", us: "NCERT-first", others: "Mixed sources" },
  { feature: "Doubt Support", us: "AI + Teacher", others: "Generic chatbot" },
  { feature: "Progress Tracking", us: "Chapter-level", others: "Course-level only" },
  { feature: "Parent Visibility", us: "Full dashboard", others: "Limited or none" },
  
  { feature: "Interface", us: "Clean & focused", others: "Cluttered" },
];

const stats = [
  { value: "10K+", label: "Active Students" },
  { value: "500+", label: "Video Lessons" },
  { value: "95%", label: "Student Satisfaction" },
  { value: "24/7", label: "AI Support" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduTrack Pro</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <a href="#why" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Why Us</a>
            <Link to="/class-9" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Class 9</Link>
            <Link to="/class-10" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Class 10</Link>
            <a href="#teachers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Teachers</a>
            
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero">Start Learning</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        </div>

        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          {floatingFormulas.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 0.5, 0.3, 0.5], y: [20, 0, -10, 0] }}
              transition={{ delay: item.delay, duration: 4, repeat: Infinity, repeatType: "reverse" }}
              className={`absolute ${item.size} font-mono font-bold text-primary/30 select-none hidden md:block`}
              style={{ left: item.x, top: item.y }}
            >
              {item.formula}
            </motion.div>
          ))}
        </div>

        <div className="container relative z-10 px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">CBSE Class 9 & 10 • Math & Science</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Learn Math & Science with{" "}
              <span className="gradient-text">Clarity, Practice & Results</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              CBSE Class 9 and 10 online learning platform for concept mastery, board exam preparation, and AI-supported doubt solving. NCERT-first, step-by-step, exam-focused.
            </p>

            {/* Hero Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {heroHighlights.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                  <h.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">{h.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="hero" size="xl">
                  Start Learning <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="heroOutline" size="xl">Book Free Demo</Button>
              </Link>
              <Link to="/class-9">
                <Button variant="outline" size="xl">Explore Subjects</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== WHY EDUTRACK PRO ===== */}
      <section id="why" className="py-20 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Star className="h-4 w-4" /> Why EduTrack Pro
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built Specifically for CBSE Class 9 & 10 Success</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">No distractions, no unnecessary content. Just focused, chapter-wise learning for Math and Science.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyEduTrack.map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="stat-card group">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLASS 9 OVERVIEW ===== */}
      <section className="py-20">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" /> Class 9
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">CBSE Class 9 — Build Your Foundation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Master the fundamentals of Mathematics and Science with clear, step-by-step lessons aligned to NCERT.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {class9Subjects.map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                <p className="text-xs text-primary font-medium mb-2">{s.chapters} Chapters</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/class-9"><Button variant="hero" size="lg">Explore Class 9 <ChevronRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* ===== CLASS 10 OVERVIEW ===== */}
      <section className="py-20 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Trophy className="h-4 w-4" /> Class 10
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">CBSE Class 10 — Ace Your Board Exams</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Board-focused preparation with concept clarity, solved examples, mock tests, and AI-powered revision.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {class10Subjects.map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <s.icon className="h-7 w-7 text-accent group-hover:text-accent-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                <p className="text-xs text-accent font-medium mb-2">{s.chapters} Chapters</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/class-10"><Button variant="accent" size="lg">Explore Class 10 <ChevronRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED CHAPTERS ===== */}
      <section className="py-20">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Chapters</h2>
            <p className="text-lg text-muted-foreground">Start with the most important chapters for your board preparation.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredChapters.map((ch, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl p-5 border border-border hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{ch.subject}</span>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">Class {ch.class}</span>
                </div>
                <h3 className="font-semibold mb-2">{ch.chapter}</h3>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm text-primary mb-3">{ch.formula}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Difficulty: {ch.difficulty}</span>
                  <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW LEARNING WORKS ===== */}
      <section className="py-20 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Learning Works</h2>
            <p className="text-lg text-muted-foreground">A simple, 5-step journey from confusion to confidence.</p>
          </motion.div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-4">
            {howItWorks.map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="h-14 w-14 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">{s.step}</div>
                <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI-POWERED LEARNING ===== */}
      <section className="py-20">
        <div className="container px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Zap className="h-4 w-4" /> AI-Powered
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Personal AI Tutor</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our AI understands CBSE Class 9 & 10 curriculum deeply. Get instant help with any chapter, any problem — step by step.
              </p>
              <ul className="space-y-4 mb-8">
                {["Step-by-step problem solving", "Chapter-wise doubt support", "Smart revision plan generator", "Personalized practice questions", "Formula revision assistant", "Mistake analysis after tests"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-success shrink-0" /><span>{item}</span></li>
                ))}
              </ul>
              <Link to="/student/chat"><Button variant="hero" size="lg">Try AI Tutor <ArrowRight className="h-4 w-4" /></Button></Link>
            </motion.div>

            <motion.div {...fadeUp} className="relative">
              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">EduTrack AI Tutor</div>
                    <div className="text-xs text-muted-foreground">Online • Ready to help</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="chat-bubble-user ml-auto max-w-[80%]">How do I solve x² - 7x + 12 = 0?</div>
                  <div className="chat-bubble-ai max-w-[80%]">
                    <p className="mb-2">Let me solve this step by step:</p>
                    <div className="bg-background/50 rounded-lg p-3 font-mono text-sm space-y-1">
                      <p>1. Find factors of 12 that sum to -7</p>
                      <p>2. Factors: -3 and -4 ✓</p>
                      <p>3. (x - 3)(x - 4) = 0</p>
                      <p className="text-primary font-bold">∴ x = 3 or x = 4</p>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-primary/10 backdrop-blur rounded-lg px-3 py-2 font-mono text-sm text-primary border border-primary/20">
                ∫ x² dx = x³/3 + C
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SAMPLE PROBLEMS ===== */}
      <section className="py-20 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn With Real Problems</h2>
            <p className="text-lg text-muted-foreground">Master Math & Science with step-by-step solutions.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {sampleProblems.map((p, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.15 }}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{p.subject}</span>
                  <span className="text-xs text-muted-foreground">{p.topic}</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 mb-4"><p className="font-mono text-sm font-medium">{p.problem}</p></div>
                <div className="space-y-2 mb-4">
                  {p.steps.map((step, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">{j + 1}</span>
                      <span className="font-mono text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Answer:</span>
                  <span className="font-mono font-bold text-primary">{p.solution}</span>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Formula Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { formula: "E = mc²", label: "Mass-Energy" },
              { formula: "F = ma", label: "Newton's 2nd" },
              { formula: "v = u + at", label: "Kinematics" },
              { formula: "s = ut + ½at²", label: "Displacement" },
              { formula: "P = IV", label: "Electric Power" },
              { formula: "λf = v", label: "Wave Equation" },
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05, y: -5 }} className="glass-card rounded-xl p-4 text-center cursor-pointer group">
                <div className="text-xl font-mono font-bold text-primary group-hover:gradient-text transition-all">{f.formula}</div>
                <div className="text-xs text-muted-foreground mt-1">{f.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STUDENT SUCCESS JOURNEY ===== */}
      <section className="py-20">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Success Journey</h2>
            <p className="text-lg text-muted-foreground">From basics to board exam — we track your progress at every step.</p>
          </motion.div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Foundation", desc: "Build strong basics with NCERT concepts", color: "bg-primary/10 text-primary" },
              { icon: ClipboardList, title: "Practice", desc: "Solve chapter-wise questions & tests", color: "bg-accent/10 text-accent" },
              { icon: Brain, title: "Mastery", desc: "Clear doubts with AI & revise smartly", color: "bg-success/10 text-success" },
              { icon: Trophy, title: "Results", desc: "Score high in CBSE board exams", color: "bg-warning/10 text-warning" },
            ].map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
                <div className={`h-16 w-16 rounded-2xl ${s.color} flex items-center justify-center mx-auto mb-4`}>
                  <s.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON SECTION ===== */}
      <section className="py-20 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why EduTrack Pro is Better for CBSE 9 & 10</h2>
            <p className="text-lg text-muted-foreground">Focused. Simple. Affordable. Built for your board success.</p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-3 bg-primary text-primary-foreground font-semibold text-sm">
                <div className="p-4">Feature</div>
                <div className="p-4 text-center">EduTrack Pro</div>
                <div className="p-4 text-center">Others</div>
              </div>
              {comparisonPoints.map((c, i) => (
                <div key={i} className="grid grid-cols-3 border-t border-border text-sm">
                  <div className="p-4 font-medium">{c.feature}</div>
                  <div className="p-4 text-center text-primary font-medium">{c.us}</div>
                  <div className="p-4 text-center text-muted-foreground">{c.others}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARENT TRUST SECTION ===== */}
      <section className="py-20">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
              <Shield className="h-4 w-4" /> For Parents
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Parents Trust EduTrack Pro</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Stay informed about your child's learning progress with complete transparency.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: "Progress Reports", desc: "See chapter-wise completion and test scores" },
              { icon: Clock, title: "Time Tracking", desc: "Know how much time your child spends learning" },
              { icon: Shield, title: "Safe Environment", desc: "No distractions, no social features, just learning" },
              { icon: Users, title: "Teacher Feedback", desc: "Get insights from teachers about your child's performance" },
            ].map((p, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <p.icon className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MEET OUR TEACHERS ===== */}
      <section id="teachers" className="py-20 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Teachers</h2>
            <p className="text-lg text-muted-foreground">Experienced, dedicated, and passionate about helping students succeed.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teachers.map((t, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.15 }}
                className="bg-card rounded-2xl p-8 border border-border hover:shadow-xl transition-all">
                <div className="flex items-start gap-5 mb-5">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t.name}</h3>
                    <p className="text-sm text-primary font-medium">{t.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.focus}</p>
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs text-primary font-medium">
                      <Star className="h-3 w-3" /> Experienced Faculty
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.bio}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {t.tags.map((tag, j) => (
                    <span key={j} className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="hero" size="sm">Book Demo Class</Button>
                  <Button variant="outline" size="sm">View Courses</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Students & Parents Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.class}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.details key={i} {...fadeUp} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border group">
                <summary className="p-5 font-semibold cursor-pointer flex items-center justify-between text-sm hover:text-primary transition-colors">
                  {faq.q}
                  <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-[10%] text-3xl font-mono text-primary-foreground/20">E = ½mv²</div>
          <div className="absolute bottom-20 right-[15%] text-2xl font-mono text-primary-foreground/20">a² + b² = c²</div>
          <div className="absolute top-1/3 right-[10%] text-4xl font-mono text-primary-foreground/20">Σ</div>
        </div>
        <div className="container relative z-10 px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">Ready to Start Your CBSE Journey?</h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Join thousands of Class 9 & 10 students who are learning Math and Science the smart way.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="xl" className="bg-background text-foreground hover:bg-background/90 shadow-xl">
                  Get Started Today <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="heroOutline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Book Free Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-16 border-t border-border">
        <div className="container px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">EduTrack Pro</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CBSE Class 9 & 10 online learning platform for Mathematics and Science. NCERT-aligned, AI-powered, exam-focused.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/class-9" className="hover:text-foreground transition-colors">Class 9</Link></li>
                <li><Link to="/class-10" className="hover:text-foreground transition-colors">Class 10</Link></li>
                
                <li><a href="#teachers" className="hover:text-foreground transition-colors">Our Teachers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Subjects</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/subjects/mathematics" className="hover:text-foreground transition-colors">Mathematics</Link></li>
                <li><Link to="/subjects/physics" className="hover:text-foreground transition-colors">Physics</Link></li>
                <li><Link to="/subjects/chemistry" className="hover:text-foreground transition-colors">Chemistry</Link></li>
                <li><Link to="/subjects/biology" className="hover:text-foreground transition-colors">Biology</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 dccloud.in.net — EduTrack Pro. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>CBSE Class 9 Science online classes</span>
              <span>•</span>
              <span>CBSE Class 10 Maths board preparation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
