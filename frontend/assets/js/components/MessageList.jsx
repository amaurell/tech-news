const { useRef, useEffect } = React

function MessageList ({ messages, onReadMore }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-window__messages" role="log" aria-live="polite" aria-label="Mensagens">
      {messages.map(msg => (
        <MessageItem key={msg.id} message={msg} onReadMore={onReadMore} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
