import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function ServiceFAQs({ items = [], serviceTitle }) {
  const [openIndex, setOpenIndex] = useState(null);
  const reduceMotion = useReducedMotion();
  if (!items.length) return null;
  const serviceId = serviceTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return <section className="service-faq-section" aria-labelledby="service-faq-title">
    <div className="service-faq-inner">
      <header className="service-faq-heading">
        <span className="eyebrow">SERVICE QUESTIONS</span>
        <h2 id="service-faq-title">Questions about {serviceTitle.toLowerCase()}.</h2>
        <p>Clear answers to help you prepare for the next step.</p>
        <Link className="service-faq-more" to="/contact">Ask our team <span aria-hidden="true">→</span></Link>
      </header>
      <div className="service-faq-list">
        {items.map((item, index) => {
          const open = openIndex === index;
          const answerId = `service-faq-${serviceId}-${index}`;
          return <article className={`service-faq-item${open ? ' is-open' : ''}`} key={item.question}>
            <h3>
              <button type="button" aria-expanded={open} aria-controls={answerId} onClick={() => setOpenIndex(open ? null : index)}>
                <span>{item.question}</span>
                <Plus className="service-faq-plus" size={20} strokeWidth={1.7} aria-hidden="true"/>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open && <motion.div
                className="service-faq-answer"
                id={answerId}
                key={answerId}
                initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
              ><p>{item.answer}</p></motion.div>}
            </AnimatePresence>
          </article>;
        })}
      </div>
    </div>
  </section>;
}
