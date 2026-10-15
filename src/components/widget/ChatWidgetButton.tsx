import { buttonVariants } from "@/components/ui/button"
import { PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChatOrb } from "./ChatOrb"

function ChatWidgetButton() {
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <PopoverTrigger
        className={cn(
          buttonVariants(),
          "h-12 justify-start gap-2 rounded-full border border-border bg-background pr-4 pl-2 text-foreground shadow-lg hover:bg-background hover:shadow-xl"
        )}
      >
        <ChatOrb className="size-9" />
        <span className="text-sm font-medium">FixBot</span>
      </PopoverTrigger>
    </div>
  )
}

export { ChatWidgetButton }
