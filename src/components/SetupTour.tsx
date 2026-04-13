"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Box, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Network, 
  ExternalLink,
  ChevronRight,
  Loader2,
  Terminal,
  Home
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface StepData {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  details: string[];
  link: string;
  invite?: string;
  command?: string;
}

const STEPS: StepData[] = [
  {
    id: "tailscale",
    title: "Secure Tunnel",
    description: "Connect to the private Brain network via Tailscale for encrypted communication.",
    icon: Network,
    action: "Download & Join",
    details: [
      "Install Tailscale on your machine",
      "Login to your Tailscale account",
      "Join the shared Brain network via the provided link"
    ],
    link: "https://tailscale.com/download",
    invite: "https://login.tailscale.com/admin/invite/PwkjyPpPpW2mk3CrBunP11"
  },
  {
    id: "docker",
    title: "Engine Prerequisites",
    description: "The Brain requires Docker to execute tasks in isolated environments.",
    icon: Box,
    action: "Check Docker",
    details: [
      "Ensure Docker Desktop is installed",
      "Start the Docker engine in the background",
      "No manual configuration needed beyond running it"
    ],
    link: "https://www.docker.com/products/docker-desktop/"
  },
  {
    id: "muscle",
    title: "Deploy Muscle",
    description: "Launch your worker node to start contributing compute power to the cluster.",
    icon: Cpu,
    action: "Download & Install",
    details: [
      "Download the muscle binary for your system",
      "Execute the application to join the cluster",
      "Watch the dashboard to see your node come online"
    ],
    link: "/bam-muscle.exe"
  }
];

const OS_OPTIONS = [
  { id: "windows", label: "Windows", icon: Cpu },
  { id: "linux", label: "Linux", icon: Terminal },
  { id: "macos", label: "MacOS", icon: Box },
] as const;

export default function SetupTour({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOS, setSelectedOS] = useState<"windows" | "linux" | "macos">("windows");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMuscleOnline, setIsMuscleOnline] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push(isLoggedIn ? "/dashboard" : "/login");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    router.push(isLoggedIn ? "/dashboard" : "/login");
  };


  let currentStepData: StepData = { ...STEPS[currentStep] };

  // Dynamic content for the Muscle step
  if (currentStep === 2) {
    const osData = {
      windows: {
        details: [
          "Download the bam-muscle.exe binary",
          "Double-click to start the worker node",
          "Default Specs: 2 CPU / 2048 MB RAM unless specified"
        ],
        link: "/bam-muscle.exe"
      },
      linux: {
        details: [
          "Download the muscle-linux binary",
          "Launch the file to initiate the worker",
          "It will seamlessly connect to the Brain and listen for jobs"
        ],
        link: "/muscle-linux"
      },
      macos: {
        details: [
          "Download macOS arm64 binary",
          "Execute the application to start the node",
          "It will securely tunnel back and register to the active fleet"
        ],
        link: "/muscle-macos-arm64"
      }
    };

    currentStepData = {
      ...currentStepData,
      ...osData[selectedOS]
    };
  }

  return (
    <div className="min-h-screen bg-nebula-black text-white selection:bg-nebula-pink/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Navigation */}
      <div className="fixed top-10 left-10 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest group"
        >
          <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-nebula-purple/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-nebula-pink/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full z-10 relative">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-center">
            <Image 
              src="/logo2.png" 
              alt="Brain & Muscle Logo" 
              width={160} 
              height={100} 
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Initialize <span className="text-gradient">Intelligence</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Complete the 3-step setup to connect your node to the Brain & Muscle cluster.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between mb-12 px-2 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-brand-primary -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500
                  ${isActive ? 'bg-nebula-black border-brand-primary text-brand-primary shadow-[0_0_15px_rgba(166,77,121,0.3)]' : 'bg-nebula-black border-white/10 text-gray-600'}
                  ${isCurrent ? 'scale-110' : 'scale-100'}
                `}>
                  {idx < currentStep ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className={`mt-3 text-[10px] uppercase tracking-widest font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                  <currentStepData.icon className="w-8 h-8 text-brand-primary" />
                  {currentStepData.title}
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {currentStep === 2 && (
                <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
                  {OS_OPTIONS.map((os) => (
                    <button
                      key={os.id}
                      onClick={() => setSelectedOS(os.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        selectedOS === os.id 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                          : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      <os.icon className="w-3.5 h-3.5" />
                      {os.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                {currentStepData.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-3 h-3 text-brand-primary" />
                    </div>
                    <span className="text-sm text-gray-300">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className={`
                w-24 h-24 rounded-3xl border border-white/10 bg-white/[0.03] flex items-center justify-center mb-4 transition-all duration-500
                ${isMuscleOnline ? 'border-green-500/50 bg-green-500/10' : ''}
              `}>
                {currentStep === 2 ? (
                   isVerifying ? <Loader2 className="w-10 h-10 text-brand-primary animate-spin" /> :
                   isMuscleOnline ? <CheckCircle2 className="w-12 h-12 text-green-500" /> :
                   <Cpu className="w-12 h-12 text-gray-500" />
                ) : (
                  <currentStepData.icon className="w-12 h-12 text-brand-primary/50" />
                )}
              </div>

              <a 
                href={currentStepData.link} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setIsMuscleOnline(true)}
                className="btn-primary w-full gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{currentStepData.action}</span>
              </a>

              {currentStep === 0 && currentStepData.invite && (
                <a 
                  href={currentStepData.invite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Brain Network
                </a>
              )}

            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleSkip}
                className="text-gray-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
              >
                {isLoggedIn ? "Visit Dashboard" : "Skip to Login"}
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent("bam:open-support"))}
                className="text-brand-primary/60 hover:text-brand-primary text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                Report an Issue
              </button>
            </div>

            <div className="flex items-center gap-4">
              {currentStep > 0 && (
                <button 
                  onClick={handleBack}
                  className="px-8 py-4 rounded-2xl border border-white/5 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all duration-300"
                >
                  Back
                </button>
              )}
              <button 
                onClick={handleNext}
                disabled={currentStep === 2 && !isMuscleOnline}
                className={`
                  group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-500
                  ${(currentStep === 2 && !isMuscleOnline)
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    : 'bg-white text-black hover:bg-brand-primary hover:text-white shadow-xl hover:shadow-brand-primary/30'}
                `}
              >
                {currentStep === STEPS.length - 1 ? (isLoggedIn ? "Go to Dashboard" : "Start Experience") : "Next Step"}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-12 flex items-center justify-center gap-2 text-gray-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">End-to-End Cryptographic Security Active</span>
        </div>
      </div>
    </div>
  );
}
