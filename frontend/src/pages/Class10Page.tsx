import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, BookOpen, ArrowRight, CheckCircle2, Calculator, Atom, Sparkles, Microscope, ChevronRight, ArrowLeft,
  Play, FileText, ClipboardList, Brain, Download, HelpCircle, Target, BarChart3, Trophy,
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const mathChapters = [
  "Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations",
  "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry",
  "Some Applications of Trigonometry", "Circles", "Areas Related to Circles", "Surface Areas and Volumes",
  "Statistics", "Probability",
];

const physicsChapters = ["Light – Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy"];
const chemistryChapters = ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-Metals", "Carbon and Its Compounds", "Periodic Classification of Elements"];
const biologyChapters = ["Life Processes", "Control and Coordination", "How Do Organisms Reproduce", "Heredity and Evolution", "Our Environment", "Sustainable Management of Natural Resources"];

const boardFeatures = [
  "Board Exam Focus Points", "Important Derivations", "Assertion-Reason Practice",
  "Case-Based Questions", "Numerical Problems", "Formula Recap", "Mock Test Links",
];

const chapterFeatures = [
  "Concept Notes", "NCERT Solutions", "Solved Examples", "Practice Questions",
  "Revision Notes", "Diagrams & Visuals", "Quiz", "Completion Tracker",
];

function ChapterCard({ name, index }: { name: string; index: number }) {
  return (
    <motion.div {...fadeUp} transition={{ delay: index * 0.03 }}
      className="bg-card rounded-xl p-5 border border-border hover:shadow-lg hover:border-accent/30 transition-all group cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-lg bg-accent/10 text-accent text-sm font-bold flex items-center justify-center">{index + 1}</span>
          <h3 className="font-medium text-sm">{name}</h3>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chapterFeatures.slice(0, 4).map((f, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
        ))}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">+{chapterFeatures.length - 4} more</span>
      </div>
    </motion.div>
  );
}

function SubjectSection({ title, icon: Icon, chapters, color }: { title: string; icon: any; chapters: string[]; color: string }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{chapters.length} Chapters</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((ch, i) => <ChapterCard key={i} name={ch} index={i} />)}
      </div>
    </div>
  );
}

export default function Class10Page() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Trophy className="h-4 w-4" /> CBSE Class 10 — Board Year
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Class 10 — Ace Your Board Exams</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8">
              Board-focused preparation with concept clarity, NCERT solutions, assertion-reason questions, case-based practice, mock tests, and AI-powered revision support.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["30 Chapters", "Board Exam Focus", "Mock Tests", "Case-Based Questions", "AI Revision"].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  <span className="text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Board Exam Features */}
      <section className="pb-12">
        <div className="container px-6">
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-accent" /> Board Exam Special Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {boardFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container px-6">
          <SubjectSection title="Mathematics" icon={Calculator} chapters={mathChapters} color="bg-primary/10 text-primary" />
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Science</h2>
            <p className="text-muted-foreground">Complete CBSE Class 10 Science divided by subject for focused board preparation.</p>
          </div>
          
          <SubjectSection title="Physics" icon={Atom} chapters={physicsChapters} color="bg-accent/10 text-accent" />
          <SubjectSection title="Chemistry" icon={Sparkles} chapters={chemistryChapters} color="bg-warning/10 text-warning" />
          <SubjectSection title="Biology" icon={Microscope} chapters={biologyChapters} color="bg-success/10 text-success" />
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Every Chapter Includes</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: FileText, title: "Simplified Notes" },
              { icon: Target, title: "Board Exam Focus" },
              { icon: Calculator, title: "Derivations" },
              { icon: HelpCircle, title: "Assertion-Reason" },
              { icon: ClipboardList, title: "Case-Based Qs" },
              { icon: Play, title: "Revision Videos" },
              { icon: Brain, title: "AI Doubt Help" },
              { icon: BarChart3, title: "Completion Tracker" },
              { icon: BookOpen, title: "NCERT Solutions" },
              { icon: Download, title: "Worksheets" },
              { icon: Target, title: "Mock Tests" },
              { icon: FileText, title: "Formula Recap" },
            ].map((f, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border text-center">
                <f.icon className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-xs font-medium">{f.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Boards?</h2>
          <p className="text-muted-foreground mb-8">Start your board exam preparation with focused, chapter-wise learning.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/auth"><Button variant="hero" size="xl">Start Preparing <ArrowRight className="h-5 w-5" /></Button></Link>
            <Link to="/class-9"><Button variant="outline" size="xl">View Class 9</Button></Link>
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
