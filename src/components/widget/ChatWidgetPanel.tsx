import { XIcon } from "lucide-react"
import { motion, type Variants } from "motion/react"

import { buttonVariants } from "@/components/ui/button"
import {
  PopoverClose,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChatInputBar } from "./ChatInputBar"
import { ChatMessageList } from "./ChatMessageList"
import type { ChatMessage } from "./types"

interface ChatWidgetPanelProps {
  messages: ChatMessage[]
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  onExitComplete: () => void
}

const PANEL_VARIANTS: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
  },
  closed: {
    opacity: 0,
    y: 24,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
}

function ChatWidgetPanel({
  messages,
  draft,
  onDraftChange,
  onSend,
  onExitComplete,
}: ChatWidgetPanelProps) {
  return (
    <PopoverPortal>
      <PopoverPositioner
        side="top"
        align="end"
        positionMethod="fixed"
        collisionAvoidance={{ side: "none", align: "none" }}
      >
        <PopoverPopup
          render={(props, state) => (
            <motion.div
              {...(props as React.ComponentProps<typeof motion.div>)}
              initial="closed"
              animate={state.open ? "open" : "closed"}
              variants={PANEL_VARIANTS}
              onAnimationComplete={(definition) => {
                if (definition === "closed") {
                  onExitComplete()
                }
              }}
            />
          )}
          className="flex h-[min(600px,calc(100vh-6rem))] w-[380px] flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-xl"
        >
          <div className="flex items-center justify-between border-b p-4">
            <span className="text-sm font-medium">채팅</span>
            <PopoverClose
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <XIcon />
              <span className="sr-only">닫기</span>
            </PopoverClose>
          </div>
          <ChatMessageList messages={messages} />
          <ChatInputBar
            value={draft}
            onChange={onDraftChange}
            onSubmit={onSend}
          />
        </PopoverPopup>
      </PopoverPositioner>
    </PopoverPortal>
  )
}

export { ChatWidgetPanel }
