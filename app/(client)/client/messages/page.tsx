export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
        <span className="material-symbols-outlined text-primary text-4xl">chat_bubble</span>
      </div>
      <h1 className="text-3xl font-headline font-black text-on-surface tracking-tighter">Messages</h1>
      <p className="text-on-surface-variant max-w-xs">Real-time chat with professionals is currently being synchronized with your district nodes.</p>
    </div>
  );
}
