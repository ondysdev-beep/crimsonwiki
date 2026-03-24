export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-dark-600 border-t-crimson-500 rounded-full animate-spin mb-4" />
      <p className="text-sm text-dark-400">{text}</p>
    </div>
  );
}
