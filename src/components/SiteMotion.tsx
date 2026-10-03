import { useEffect } from 'react';

export default function SiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section'));

    root.classList.add('motion-effects-ready');
    sections.forEach((section) => section.classList.add('motion-section'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('motion-section--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );

    sections.forEach((section) => observer.observe(section));

    const moveGlow = (event: PointerEvent) => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`);
      root.style.setProperty('--pointer-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', moveGlow, { passive: true });

    return () => {
      observer.disconnect();
      root.classList.remove('motion-effects-ready');
      window.removeEventListener('pointermove', moveGlow);
    };
  }, []);

  return <div className="pointer-glow" aria-hidden="true" />;
}
