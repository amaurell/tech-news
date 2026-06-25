const PRESETS = [
  { label: 'Tecnologia', msg: '5 notícias de tecnologia' },
  { label: 'Mundo',      msg: '5 notícias de mundo'      },
  { label: 'Economia',   msg: '5 notícias de economia'   },
  { label: 'Esportes',   msg: '5 notícias de esportes'   },
  { label: 'Ciência',    msg: '5 notícias de ciência'    },
  { label: 'Games',      msg: '5 notícias de games'      },
]

function PresetButtons ({ onSelect, disabled }) {
  return (
    <div className="presets" role="group" aria-label="Tópicos rápidos">
      {PRESETS.map(p => (
        <button
          key={p.msg}
          className="presets__btn"
          onClick={() => onSelect(p.msg)}
          disabled={disabled}
          aria-label={p.label}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
