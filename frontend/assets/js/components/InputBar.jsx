const { useState, useRef } = React

function InputBar ({ onSend, disabled }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = () => {
    if (text.trim()) {
      onSend(text.trim())
      setText('')
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  return (
    <div className="input-bar" role="form" aria-label="Enviar mensagem">
      <input
        ref={inputRef}
        className="input-bar__field"
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Ex: 5 notícias de tecnologia em português..."
        disabled={disabled}
        aria-label="Campo de mensagem"
        maxLength={200}
        autoComplete="off"
      />
      <button
        className="input-bar__btn"
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        aria-label="Enviar"
      >
        Enviar
      </button>
    </div>
  )
}
