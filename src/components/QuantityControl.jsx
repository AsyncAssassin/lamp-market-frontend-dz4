export function QuantityControl({ value, min = 1, max, onChange, label = 'Количество', disabled = false }) {
  const hasMax = Number.isFinite(max)
  const normalize = (nextValue) => {
    const flooredValue = Math.max(min, Math.floor(nextValue))
    return hasMax ? Math.min(max, flooredValue) : flooredValue
  }
  const decrease = () => onChange(Math.max(min, value - 1))
  const increase = () => onChange(normalize(value + 1))
  const updateValue = (rawValue) => {
    if (rawValue.trim() === '') {
      return
    }

    const numeric = Number(rawValue)
    if (!Number.isFinite(numeric)) {
      return
    }

    onChange(normalize(numeric))
  }

  return (
    <div className="quantity-control" aria-label={label}>
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= min}
        aria-label="Уменьшить"
      >
        -
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        min={min}
        max={hasMax ? max : undefined}
        type="number"
        step="1"
        value={value}
        disabled={disabled}
        onChange={(event) => updateValue(event.target.value)}
      />
      <button
        type="button"
        onClick={increase}
        disabled={disabled || (hasMax && value >= max)}
        aria-label="Увеличить"
      >
        +
      </button>
    </div>
  )
}
