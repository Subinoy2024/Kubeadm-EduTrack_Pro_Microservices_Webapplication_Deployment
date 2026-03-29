import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, BookOpen, ArrowRight, ArrowLeft, CheckCircle2, Calculator, Atom, Sparkles, Microscope,
  ChevronRight, Play, FileText, ClipboardList, Brain, Target, BarChart3, Star,
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const subjectData: Record<string, {
  title: string;
  icon: any;
  color: string;
  tagline: string;
  why: string;
  class9: string[];
  class10: string[];
}> = {
  mathematics: {
    title: "Mathematics",
    icon: Calculator,
    color: "bg-primary/10 text-primary",
    tagline: "Build strong mathematical foundations with step-by-step problem solving.",
    why: "Mathematics is the backbone of Science. A strong grasp of Math helps you excel in Physics, Chemistry, and logical thinking. CBSE board exams reward clarity, accuracy, and practice — exactly what we focus on.",
    class9: ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Areas of Parallelograms and Triangles", "Circles", "Constructions", "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"],
    class10: ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry", "Circles", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"],
  },
  physics: {
    title: "Physics",
    icon: Atom,
    color: "bg-accent/10 text-accent",
    tagline: "Understand the laws of nature through clear explanations and problem solving.",
    why: "Physics teaches you how the world works. From motion to electricity, understanding Physics concepts deeply helps you solve numerical problems confidently and score well in CBSE board exams.",
    class9: ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound"],
    class10: ["Light – Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy"],
  },
  chemistry: {
    title: "Chemistry",
    icon: Sparkles,
    color: "bg-warning/10 text-warning",
    tagline: "Learn chemical concepts with clear reactions, equations, and practical understanding.",
    why: "Chemistry connects the visible world to the invisible atomic world. Master chemical reactions, equations, and periodic trends to score full marks in CBSE boards.",
    class9: ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom"],
    class10: ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-Metals", "Carbon and Its Compounds", "Periodic Classification of Elements"],
  },
  biology: {
    title: "Biology",
    icon: Microscope,
    color: "bg-success/10 text-success",
    tagline: "Explore life sciences with diagrams, explanations, and exam-focused content.",
    why: "Biology is about understanding life itself. From cells to ecosystems, clear diagrams and structured notes help you remember and score in CBSE exams.",
    class9: ["The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Why Do We Fall Ill", "Natural Resources", "Improvement in Food Resources"],
    class10: ["Life Processes", "Control and Coordination", "How Do Organisms Reproduce", "Heredity and Evolution", "Our Environment", "Sustainable Management of Natural Resources"],
  },
};

const features = [
  { icon: Play, title: "Concept Videos" },
  { icon: FileText, title: "Notes & Formulas" },
  { icon: ClipboardList, title: "Practice Sets" },
  { icon: Target, title: "Mock Tests" },
  { icon: Brain, title: "Ask AI" },
  { icon: BarChart3, title: "Quick Revision" },
];

export default function SubjectPage() {
  const { subject } = useParams<{ subject: string }>();
  const data = subjectData[subject || "mathematics"];

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Subject Not Found</h1>
          <Link to="/"><Button variant="hero">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduTrack Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/class-9"><Button variant="outline" size="sm">Class 9</Button></Link>
            <Link to="/class-10"><Button variant="outline" size="sm">Class 10</Button></Link>
            <Link to="/auth"><Button variant="hero" size="sm">Start Learning</Button></Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16">
        <div className="container px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`h-16 w-16 rounded-2xl ${data.color} flex items-center justify-center`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">{data.title}</h1>
                <p className="text-lg text-muted-foreground">{data.tagline}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why this subject */}
      <section className="pb-16">
        <div className="container px-6">
          <motion.div {...fadeUp} className="bg-card rounded-2xl p-8 border border-border max-w-3xl">
            <h2 className="text-xl font-bold mb-3">Why {data.title} Matters</h2>
            <p className="text-muted-foreground leading-relaxed">{data.why}</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-16">
        <div className="container px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border text-center hover:shadow-md transition-all cursor-pointer">
                <f.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">{f.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Class 9 Chapters */}
      <section className="pb-16">
        <div className="container px-6">
          <h2 className="text-2xl font-bold mb-6">Class 9 — {data.title} Chapters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.class9.map((ch, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-4 border border-border hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="font-medium text-sm">{ch}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Class 10 Chapters */}
      <section className="pb-16 bg-muted/30 py-16">
        <div className="container px-6">
          <h2 className="text-2xl font-bold mb-6">Class 10 — {data.title} Chapters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.class10.map((ch, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-4 border border-border hover:shadow-lg hover:border-accent/30 transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="font-medium text-sm">{ch}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Learning {data.title}</h2>
          <p className="text-muted-foreground mb-8">Begin from basics or jump to board exam mode.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/auth"><Button variant="hero" size="lg">Start from Basics <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/auth"><Button variant="accent" size="lg">Board Exam Mode <Target className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="container px-6 text-center">
          <p className="text-sm text-muted-foreground">© 2026 dccloud.in.net — EduTrack Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
