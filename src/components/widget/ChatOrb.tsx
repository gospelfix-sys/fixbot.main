import { cn } from "@/lib/utils"

function ChatOrb({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full bg-[conic-gradient(from_200deg,theme(colors.violet.500),theme(colors.fuchsia.400),theme(colors.amber.300),theme(colors.sky.400),theme(colors.violet.500))] bg-[length:200%_200%]",
        className
      )}
    />
  )
}

export { ChatOrb }
