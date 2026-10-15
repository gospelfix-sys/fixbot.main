"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { Popover } from "@/components/ui/popover"
import { ChatWidgetButton } from "./ChatWidgetButton"
import { ChatWidgetPanel } from "./ChatWidgetPanel"
import type { ChatMessage } from "./types"

const MOCK_REPLIES = [
  "아직 실제 응답 기능은 연결되어 있지 않아요. UI 데모입니다.",
  "곧 실제 AI 응답과 연결될 예정이에요. 조금만 기다려주세요!",
]

function FloatingChatWidget() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [draft, setDraft] = React.useState("")
  const isMountedRef = React.useRef(true)
  const actionsRef = React.useRef<PopoverPrimitive.Root.Actions>(null)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleSend = () => {
    const content = draft.trim()
    if (!content) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setDraft("")

    window.setTimeout(() => {
      if (!isMountedRef.current) return
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: MOCK_REPLIES[prev.length % MOCK_REPLIES.length],
          createdAt: Date.now(),
        },
      ])
    }, 600)
  }

  const handleOpenChange = (
    nextOpen: boolean,
    eventDetails: PopoverPrimitive.Root.ChangeEventDetails
  ) => {
    if (!nextOpen) {
      // Keep the panel mounted until the motion exit animation finishes.
      eventDetails.preventUnmountOnClose()
    }
    setOpen(nextOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} actionsRef={actionsRef}>
      <ChatWidgetButton />
      <ChatWidgetPanel
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
        onExitComplete={() => actionsRef.current?.unmount()}
      />
    </Popover>
  )
}

export { FloatingChatWidget }
