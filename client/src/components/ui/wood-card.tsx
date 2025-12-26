import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface WoodCardProps extends PropsWithChildren {
  className?: string;
  title?: string;
  onClick?: () => void;
}

export function WoodCard({ children, className, title, onClick }: WoodCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative bg-wood-pattern rounded-xl border-4 border-wood-dark shadow-xl overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-black/20 before:pointer-events-none",
        onClick && "cursor-pointer hover:scale-[1.02] transition-transform active:scale-95",
        className
      )}
    >
      {/* Screw heads in corners */}
      <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-stone-400 border border-stone-600 shadow-inner" />
      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-stone-400 border border-stone-600 shadow-inner" />
      <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-stone-400 border border-stone-600 shadow-inner" />
      <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-stone-400 border border-stone-600 shadow-inner" />

      {title && (
        <div className="bg-wood-dark/90 text-center py-2 border-b-2 border-wood-light/30">
          <h3 className="text-gold text-xl drop-shadow-md">{title}</h3>
        </div>
      )}
      
      <div className="p-4 relative z-10">
        {children}
      </div>
    </div>
  );
}
