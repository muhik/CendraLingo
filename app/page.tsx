"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, ArrowRight, Star, Globe, Menu, CheckCircle, Flame, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUserProgress } from "@/store/use-user-progress";
import { useRouter } from "next/navigation";

import { AuthModal } from "@/components/modals/auth-modal"; // Import AuthModal

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState("ENGLISH");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); // Valid state placement
  const { streak, points, setGuest } = useUserProgress();
  const [pendingUpgrade, setPendingUpgrade] = useState(false);

  // Handle Subscribe Click
  const handleSubscribe = () => {
    setPendingUpgrade(true);
    setShowAuthModal(true);
  };

  const onAuthSuccess = () => {
    if (pendingUpgrade) {
      router.push("/shop?auto_upgrade=true");
    } else {
      router.push("/learn");
    }
  };
  const handleStartLearning = async () => {
    try {
      // Call API to create guest session in DB
      const res = await fetch("/api/auth/guest", { method: "POST" });
      const data = await res.json();

      if (data.success && data.userId) {
        // Update Local State with the SERVER ID
        setGuest(data.userId); // Use the setGuest function from the store
      }
      router.push("/learn");
    } catch (e) {
      console.error(e);
      router.push("/learn"); // Fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#022c22] text-white overflow-hidden">

      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 border-b border-white/10 bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <img src="/mascot_final.png" alt="Logo" className="object-contain w-full h-full" />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white">Cendra Lingo</span>
            {/* Removed AI Badge */}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
            <Link href="#method" className="hover:text-primary transition-colors">Method</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative hidden md:block">
              <Button
                variant="ghost"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 font-bold uppercase tracking-wide"
              >
                <Globe className="h-4 w-4" />
                <span>{lang}</span>
                <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
              </Button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-[#162f21] border border-[#23482f] rounded-xl shadow-xl overflow-hidden z-50 flex flex-col py-1"
                  >
                    <button
                      onClick={() => { setLang("ENGLISH"); setIsLangOpen(false); }}
                      className="px-4 py-3 text-left text-sm font-bold text-gray-300 hover:bg-[#23482f] hover:text-white flex items-center gap-3 transition-colors"
                    >
                      <span className="text-lg">🇺🇸</span> English
                    </button>
                    <button
                      onClick={() => { setLang("INDONESIA"); setIsLangOpen(false); }}
                      className="px-4 py-3 text-left text-sm font-bold text-gray-300 hover:bg-[#23482f] hover:text-white flex items-center gap-3 transition-colors"
                    >
                      <span className="text-lg">🇮🇩</span> Indonesia
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 font-bold uppercase tracking-wide"
              onClick={() => setShowAuthModal(true)}
            >
              Log In
            </Button>
            <Button variant="ghost" className="md:hidden text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center relative pt-20">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[128px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12 lg:py-20">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
          >
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
              Master a new <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-200">
                language.
              </span> <br />
              <span className="text-primary">Zero friction.</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-400 max-w-[540px] leading-relaxed font-medium">
              Join millions of learners. Start speaking in minutes with our gamified lessons.
              No forced registration to start your first lesson.
            </p>

            {/* Add this state */}

            {/* ... (inside JSX) */}
            <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
              <Button
                size="lg"
                className="w-full md:w-auto font-black text-lg bg-[#58cc02] hover:bg-[#46a302] text-[#102216] border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all rounded-xl h-14 px-10 shadow-xl shadow-green-500/20"
                onClick={() => setShowAuthModal(true)}
              >
                START LEARNING
                <ArrowRight className="ml-2 h-5 w-5 stroke-[3]" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 bg-transparent border-2 border-[#23482f] text-gray-300 hover:border-white hover:text-white hover:bg-white/5 font-bold h-14 rounded-2xl uppercase tracking-widest"
                onClick={() => setShowAuthModal(true)}
              >
                I HAVE AN ACCOUNT
              </Button>
            </div>

            {/* Jawara PRO Promo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full pt-2"
            >
              <button
                onClick={handleSubscribe}
                className="w-full md:w-auto group relative overflow-hidden bg-gradient-to-r from-amber-400 to-yellow-500 p-[1px] rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-[0.98]"
              >
                <div className="relative bg-[#102216] rounded-[11px] px-5 py-3 flex items-center justify-between gap-4 group-hover:bg-[#162f21] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-400/20 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-yellow-400 font-bold text-xs tracking-wider uppercase">Jawara PRO</span>
                      <span className="text-white font-bold text-sm">
                        Langganan Cuma Rp 49.000
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </motion.div>
            {/* Add AuthModal Component call at end of component, e.g. before Footer or after Main */}


            <div className="flex items-center gap-2 text-sm text-primary/80 font-bold">
              <CheckCircle className="h-4 w-4" />
              <span>Free forever · No credit card required · Instant access</span>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Card Container */}
            <div className="bg-card-dark backdrop-blur-xl border border-[#23482f] rounded-[3rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl">
              {/* Glow effect inside card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Mascot */}
                <img
                  src="/mascot_final.png"
                  width={300}
                  height={300}
                  alt="Learning Mascot"
                  className="drop-shadow-2xl animate-bounce"
                />
              </div>

              {/* Floating Streak Widget */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-8 right-8 bg-[#162f21] border border-[#23482f] p-3 rounded-2xl flex items-center gap-3 shadow-xl z-20"
              >
                <div className="bg-orange-500/20 p-2 rounded-xl">
                  <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Streak</span>
                  <span className="text-white font-bold text-lg leading-none">{streak} Days</span>
                </div>
              </motion.div>

              {/* Floating Success Widget */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1, y: [0, 10, 0] }}
                transition={{
                  opacity: { delay: 0.5, duration: 0.5 },
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }
                }}
                className="absolute bottom-10 left-6 bg-[#162f21]/90 backdrop-blur-md border border-[#23482f] p-4 rounded-2xl flex items-center gap-4 shadow-xl z-20"
              >
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="h-6 w-6 text-[#112217]" />
                </div>
                <div>
                  <div className="text-white font-bold">Total XP Gained</div>
                  <div className="text-primary font-bold text-sm">{points} XP</div>
                </div>
              </motion.div>
            </div>

            {/* Background Decorative Lines */}
            <svg className="absolute -z-10 top-0 left-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 0 C 30 10 70 10 100 0" stroke="#2bee6c" fill="none" vectorEffect="non-scaling-stroke" />
              <path d="M0 100 C 30 90 70 90 100 100" stroke="#2bee6c" fill="none" vectorEffect="non-scaling-stroke" />
            </svg>
          </motion.div>

        </div>
      </main>

      {/* METHOD SECTION */}
      <section id="method" className="py-24 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Scientifically Proven Method</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="bg-card-dark p-8 rounded-3xl border border-[#23482f] hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-[#23482f] rounded-xl mb-6 flex items-center justify-center">
                <span className="text-2xl">🧬</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Effective Learning</h3>
              <p className="text-gray-400">Our courses effectively and efficiently teach reading, listening, and speaking skills.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-card-dark p-8 rounded-3xl border border-[#23482f] hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-[#23482f] rounded-xl mb-6 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Practice</h3>
              <p className="text-gray-400">Practice tailored to your level and learning pace to help you improve quickly.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-card-dark p-8 rounded-3xl border border-[#23482f] hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 bg-[#23482f] rounded-xl mb-6 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Stay Motivated</h3>
              <p className="text-gray-400">Earn rewards, track your streaks, and have fun while you learn new languages.</p>
            </div>
          </div>
        </div>
      </section>



      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 relative text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-12">Pilih Paket Belajar</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card-dark p-10 rounded-3xl border border-[#23482f]">
              <h3 className="text-2xl font-bold mb-2">Gratis</h3>
              <div className="text-4xl font-black mb-6">Rp 0</div>
              <ul className="text-left space-y-4 mb-8 text-gray-400">
                <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-primary" /> Akses Pelajaran Harian</li>
                <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-primary" /> Pantau Progress Dasar</li>
                <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-primary" /> Akses Komunitas</li>
              </ul>
              <Button
                className="w-full bg-[#23482f] hover:bg-[#23482f]/80 text-white font-bold h-12 rounded-xl"
                onClick={() => setShowAuthModal(true)}
              >
                DAFTAR GRATIS
              </Button>
            </div>

            {/* Super Plan */}
            <div className="bg-gradient-to-b from-[#23482f] to-[#102216] p-10 rounded-3xl border border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-[#102216] text-xs font-black px-3 py-1 rounded-bl-xl uppercase">PALING LARIS</div>
              <h3 className="text-2xl font-bold mb-2 text-white">Jawara PRO</h3>
              <div className="text-4xl font-black mb-6 text-primary">Rp 49.000<span className="text-sm font-medium text-white/50">/bln</span></div>
              <ul className="text-left space-y-4 mb-8 text-gray-200">
                <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-primary" /> Tanpa Iklan Mengganggu</li>
                <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-primary" /> Mode Belajar Offline</li>
                <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-primary" /> Dapat 1000 Gems & 100 Hati tiap bulan</li>
              </ul>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-[#102216] font-bold h-12 rounded-xl"
                onClick={handleSubscribe}
              >
                BERLANGGANAN SEKARANG
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Footer */}
      <footer className="border-t border-[#23482f] bg-[#102216]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-3 gap-8 items-center justify-items-center md:justify-items-start">

          {/* Stat 1 */}
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black text-white">10M+</div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active<br />Learners</div>
          </div>

          {/* Stat 3 (Moved to 2) */}
          <div className="flex items-center gap-4 border-l border-[#23482f] pl-8">
            <div className="text-4xl font-black text-white">4.9/5</div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">App Store<br />Rating</div>
          </div>

          {/* User Avatars */}
          <div className="flex items-center gap-3 border-l border-[#23482f] pl-8">
            <RecentJoiners />
          </div>
        </div>
      </footer>
      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        setOpen={setShowAuthModal}
        onSuccess={onAuthSuccess}
        isProFlow={pendingUpgrade} // Pass this prop
      />
    </div>
  );
}

// Recent Users Component (Internal)
const RecentJoiners = () => {
  const [users, setUsers] = useState<{ name: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users/recent");
        const data = await res.json();
        setUsers(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const displayUsers = users.length > 0 ? users : [
    { name: "Alex" }, { name: "Budi" }, { name: "Citra" }
  ];

  return (
    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 pr-6">
      <div className="flex -space-x-4">
        {displayUsers.map((u, i) => (
          <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-[#102216] flex items-center justify-center text-xs font-bold text-[#102216] uppercase shadow-lg">
            {u.name.substring(0, 2)}
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <p className="text-white font-bold text-sm">{users.length > 0 ? "Baru Bergabung" : "Joined recently"}</p>
        <p className="text-xs text-green-400 animate-pulse">● Online sekarang</p>
      </div>
    </div>
  );
};
