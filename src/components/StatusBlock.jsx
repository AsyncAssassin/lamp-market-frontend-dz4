export function StatusBlock({ title, text, actionText = 'Повторить', onAction, tone = 'status' }) {
  const role = tone === 'error' ? 'alert' : 'status'

  return (
    <div className="status-block" role={role} aria-live={tone === 'error' ? 'assertive' : 'polite'}>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {onAction && (
        <button className="btn btn-outline" type="button" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  )
}
