import ImportProject from "@/components/ImportProject";

export const metadata = {
  title: "Import Project | Brain & Muscle",
  description: "Connect your GitHub repositories to the distributed cluster.",
};

export default function ImportPage() {
  return (
    <main className="min-h-screen bg-bg-deep pt-20 pb-12 relative overflow-hidden">
      <div className="glow-mesh" />
      <div className="container mx-auto relative z-10 px-4">
        <ImportProject />
      </div>
    </main>
  );
}
