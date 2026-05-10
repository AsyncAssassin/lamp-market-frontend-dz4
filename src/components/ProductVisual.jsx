export function ProductVisual({ product, categoryId = product?.categoryId, size = 'large', label }) {
  const image = product?.imageUrl ?? product?.image
  const alt = label ?? product?.name ?? 'Лампа'

  return (
    <div className={`product-visual product-visual--${size} product-visual--cat-${categoryId}`}>
      {image ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <span className="lamp-shape" role="img" aria-label={alt}>
          <span className="lamp-glass" />
          <span className="lamp-base" />
        </span>
      )}
    </div>
  )
}
