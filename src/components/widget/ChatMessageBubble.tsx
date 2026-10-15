import { cn } from "@/lib/utils"
import type { ChatMessage } from "./types"

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
        isUser
          ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
          : "mr-auto rounded-bl-sm bg-muted text-foreground"
      )}
    >
      {message.content}
    </div>
  )
}

export { ChatMessageBubble }
