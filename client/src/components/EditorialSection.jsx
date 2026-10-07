import { motion, useReducedMotion } from 'framer-motion';

export default function EditorialSection({ eyebrow, title, intro, items, className = '' }) {
  const reduceMotion = useReducedMotion();
  if (!items?.length) return null;
  return <section className={`editorial-section ${className}`}>
    <div className="editorial-inner">
      <header className="editorial-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </header>
      <div className="editorial-grid">
        {items.map((item, index) => <motion.article
          className="editorial-card"
          key={`${item.title}-${index}`}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.48, delay: reduceMotion ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="editorial-rule" aria-hidden="true" />
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </motion.article>)}
      </div>
    </div>
  </section>;
}
