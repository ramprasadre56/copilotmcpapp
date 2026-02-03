"use client";

interface AnimatedConnectionProps {
  className?: string;
}

export function AnimatedConnection({ className = "" }: AnimatedConnectionProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width="60" height="40" viewBox="0 0 60 40" className="overflow-visible">
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Background Line */}
        <path
          d="M0 20 L60 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-slate-200 dark:text-slate-700"
        />

        {/* Animated Line */}
        <path
          d="M0 20 L60 20"
          fill="none"
          stroke="url(#connectionGradient)"
          strokeWidth="2"
          strokeDasharray="8 8"
          className="animate-flow"
        />

        {/* Arrow Head */}
        <polygon
          points="55,15 60,20 55,25"
          fill="url(#connectionGradient)"
        />

        {/* Animated Dot */}
        <circle r="4" fill="url(#connectionGradient)" className="animate-move-dot">
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path="M0 20 L60 20"
          />
        </circle>
      </svg>
    </div>
  );
}
