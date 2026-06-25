export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] font-sans text-white overflow-hidden">
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,220,50,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,220,50,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute bottom-[-120px] left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(255,220,50,0.08)_0%,transparent_70%)]" />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}