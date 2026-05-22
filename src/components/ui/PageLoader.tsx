export default function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070606]">
      <div className="text-xl font-sans font-black text-[#d6b66b] animate-pulse">{label}</div>
    </div>
  );
}
