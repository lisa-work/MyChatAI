'use client';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="text-sm text-muted-foreground ml-2">AI is typing...</span>
    </div>
  );
}