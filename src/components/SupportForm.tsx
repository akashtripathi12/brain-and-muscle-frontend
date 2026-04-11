"use client";

import { useState } from "react";
import { 
  X, 
  Send, 
  MessageSquare, 
  User, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface SupportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportForm({ isOpen, onClose }: SupportFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("https://formspree.io/f/mwvwgoqg", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setStatus("success");
        setTimeout(() => {
          onClose();
          setStatus("idle");
        }, 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.errors?.map((e: any) => e.message).join(", ") || "Submission failed.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again later.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg glass-panel rounded-[2.5rem] overflow-hidden relative shadow-[0_0_100px_rgba(166,77,121,0.15)] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Report an Issue</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Secure Signal to Command</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {status === "success" ? (
            <div className="py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Message Transmitted</h3>
              <p className="text-gray-400 max-w-xs">
                Your report has been received. Our intelligence team will investigate immediately.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] uppercase text-gray-400 font-bold tracking-widest px-1">Full Identity</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] uppercase text-gray-400 font-bold tracking-widest px-1">Secure Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                      placeholder="you@domain.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-[10px] uppercase text-gray-400 font-bold tracking-widest px-1">Issue Classification</label>
                <select 
                  id="subject" 
                  name="subject" 
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all appearance-none"
                >
                  <option value="Bug Report" className="bg-nebula-black">Bug Report (System Failure)</option>
                  <option value="Security Intelligence" className="bg-nebula-black">Security Intelligence</option>
                  <option value="Feature Expansion" className="bg-nebula-black">Feature Expansion</option>
                  <option value="General Support" className="bg-nebula-black">General Support</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] uppercase text-gray-400 font-bold tracking-widest px-1">Evidence / Description</label>
                <textarea 
                  id="message" 
                  name="message" 
                  required 
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all resize-none"
                  placeholder="Describe the anomaly or request..."
                />
              </div>

              {status === "error" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs animate-in shake duration-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="btn-primary w-full py-4 gap-3 text-lg group"
              >
                {status === "submitting" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
