"use client"

import * as React from "react"

import { ChatMessageBubble } from "./ChatMessageBubble"
import { ChatOrb } from "./ChatOrb"
import type { ChatMessage } from "./types"

function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <ChatOrb className="size-24" />
        <p className="text-sm text-muted-foreground">무엇이든 물어보세요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

export { ChatMessageList }
