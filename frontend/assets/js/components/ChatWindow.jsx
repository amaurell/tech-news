function ChatWindow ({ messages, onSendMessage, onReadMore, loading }) {
  return (
    <div className="chat-window">
      <header className="chat-window__header">
        <h1>NewsChat</h1>
        <p>Notícias do mundo todo via chat</p>
      </header>

      <MessageList messages={messages} onReadMore={onReadMore} />

      <PresetButtons onSelect={onSendMessage} disabled={loading} />

      <InputBar onSend={onSendMessage} disabled={loading} />
    </div>
  )
}
