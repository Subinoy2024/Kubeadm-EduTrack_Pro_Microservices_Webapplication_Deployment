import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, ArrowLeft, ArrowRight, Video, Brain, Target, ClipboardList, BarChart3, Users,
  Calendar, Trophy, BookOpen, MessageSquare, FileText, Clock, Shield, CheckCircle2, Star,
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const features = [
  { icon: Video, title: "Live Classes", desc: "Interactive live sessions with expert teachers. Ask doubts in real-time and learn with peers." },
  { icon: BookOpen, title: "Recorded Lessons", desc: "Access a complete library of recorded chapter-wise lessons anytime, anywhere." },
  { icon: Brain, title: "AI Doubt Solving", desc: "Get instant, step-by-step solutions to any Math or Science problem using our AI tutor." },
  { icon: ClipboardList, title: "Topic-wise Practice", desc: "Practice questions organized by chapter and difficulty level for targeted preparation." },
  { icon: Calendar, title: "Weekly Tests", desc: "Regular weekly tests to assess understanding and build exam confidence." },
  { icon: Target, title: "Full Syllabus Mock Exams", desc: "CBSE board-style mock tests with detailed analysis and improvement tips." },
  { icon: BarChart3, title: "Personalized Learning Path", desc: "AI-generated study plans based on your strengths, weaknesses, and pace." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Detailed dashboards showing subject-wise progress, test trends, and weak areas." },
  { icon: Users, title: "Parent Progress Reports", desc: "Monthly reports sent to parents with child's progress, attendance, and recommendations." },
  { icon: FileText, title: "Revision Planner", desc: "Smart revision schedules that prioritize weak chapters before exams." },
  { icon: Clock, title: "Exam Countdown Tracker", desc: "Stay focused with a visual countdown to your next test or board exam." },
  { icon: Trophy, title: "Chapter Mastery Badges", desc: "Earn badges as you complete chapters and master topics — stay motivated!" },
];

export default function FeaturesPage() {
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
          <Link to="/auth"><Button variant="hero" size="sm">Start Learning</Button></Link>
        </div>
      </nav>

      <section className="pt-24 pb-16">
        <div className="container px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Learning Features</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Everything you need for CBSE Class 9 & 10 success — live classes, recorded lessons, AI-powered doubt solving, smart practice, and complete progress tracking.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 gradient-primary">
        <div className="container px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Experience All Features</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Start your 7-day free trial and explore every feature.</p>
          <Link to="/auth"><Button size="xl" className="bg-background text-foreground hover:bg-background/90">Get Started Free <ArrowRight className="h-5 w-5" /></Button></Link>
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
