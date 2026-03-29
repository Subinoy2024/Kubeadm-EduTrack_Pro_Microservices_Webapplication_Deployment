import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, BookOpen, ArrowRight, CheckCircle2, Calculator, Atom, Sparkles, Microscope, ChevronRight, ArrowLeft,
  Play, FileText, ClipboardList, Brain, Download, HelpCircle, Target, BarChart3,
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const mathChapters = [
  "Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables",
  "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals",
  "Areas of Parallelograms and Triangles", "Circles", "Constructions", "Heron's Formula",
  "Surface Areas and Volumes", "Statistics", "Probability",
];

const physicsChapters = ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound"];
const chemistryChapters = ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom"];
const biologyChapters = [
  "The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms",
  "Why Do We Fall Ill", "Natural Resources", "Improvement in Food Resources",
];

const chapterFeatures = [
  "Key Concepts", "Important Formulas", "Visual Explanations", "Solved Examples",
  "NCERT Solutions", "Practice Questions", "Quiz", "Revision Notes",
];

function ChapterCard({ name, index }: { name: string; index: number }) {
  return (
    <motion.div {...fadeUp} transition={{ delay: index * 0.03 }}
      className="bg-card rounded-xl p-5 border border-border hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{index + 1}</span>
          <h3 className="font-medium text-sm">{name}</h3>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chapterFeatures.slice(0, 4).map((f, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
        ))}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">+{chapterFeatures.length - 4} more</span>
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

export default function Class9Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduTrack Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/class-10"><Button variant="outline" size="sm">Class 10</Button></Link>
            <Link to="/auth"><Button variant="hero" size="sm">Start Learning</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="container px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" /> CBSE Class 9
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Class 9 — Build Your Foundation</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8">
              Master the fundamentals of Mathematics and Science with NCERT-aligned lessons, step-by-step solutions, visual explanations, and chapter-wise practice.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["30 Chapters", "NCERT Solutions", "Chapter Tests", "AI Doubt Help", "Progress Tracking"].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subjects */}
      <section className="pb-20">
        <div className="container px-6">
          <SubjectSection title="Mathematics" icon={Calculator} chapters={mathChapters} color="bg-primary/10 text-primary" />
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Science</h2>
            <p className="text-muted-foreground">Divided into Physics, Chemistry, and Biology for focused learning.</p>
          </div>
          
          <SubjectSection title="Physics" icon={Atom} chapters={physicsChapters} color="bg-accent/10 text-accent" />
          <SubjectSection title="Chemistry" icon={Sparkles} chapters={chemistryChapters} color="bg-warning/10 text-warning" />
          <SubjectSection title="Biology" icon={Microscope} chapters={biologyChapters} color="bg-success/10 text-success" />
        </div>
      </section>

      {/* Chapter Features */}
      <section className="py-16 bg-muted/30">
        <div className="container px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Every Chapter Includes</h2>
            <p className="text-muted-foreground">Complete learning resources for every topic.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: FileText, title: "Concept Notes" },
              { icon: Calculator, title: "Important Formulas" },
              { icon: Play, title: "Video Explanations" },
              { icon: ClipboardList, title: "Solved Examples" },
              { icon: BookOpen, title: "NCERT Solutions" },
              { icon: Target, title: "Practice Questions" },
              { icon: Brain, title: "AI Doubt Support" },
              { icon: Download, title: "Downloadable Worksheets" },
              { icon: HelpCircle, title: "Quiz" },
              { icon: BarChart3, title: "Progress Tracker" },
              { icon: FileText, title: "Revision Notes" },
              { icon: ClipboardList, title: "Exam-style Questions" },
            ].map((f, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border text-center">
                <f.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">{f.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Class 9?</h2>
          <p className="text-muted-foreground mb-8">Begin your CBSE journey with chapter-wise, NCERT-aligned learning.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/auth"><Button variant="hero" size="xl">Start Learning <ArrowRight className="h-5 w-5" /></Button></Link>
            <Link to="/class-10"><Button variant="outline" size="xl">View Class 10</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container px-6 text-center">
          <p className="text-sm text-muted-foreground">© 2026 dccloud.in.net — EduTrack Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
