"use client"

import { SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

function ChatInputBar({ value, onChange, onSubmit }: ChatInputBarProps) {
  const canSend = value.trim().length > 0

  return (
    <form
      className="relative border-t p-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) onSubmit()
      }}
    >
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="메시지를 입력하세요..."
        className="h-11 rounded-full pr-11 pl-4"
      />
      <Button
        type="submit"
        size="icon-sm"
        disabled={!canSend}
        className="absolute top-1/2 right-[1.125rem] size-8 -translate-y-1/2 rounded-full"
      >
        <SendIcon className="size-4" />
        <span className="sr-only">전송</span>
      </Button>
    </form>
  )
}

export { ChatInputBar }
