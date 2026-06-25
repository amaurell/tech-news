function App () {
  const { messages, sendMessage, requestArticle, loading } = useChat()

  return (
    <ChatWindow
      messages={messages}
      onSendMessage={sendMessage}
      onReadMore={requestArticle}
      loading={loading}
    />
  )
}
