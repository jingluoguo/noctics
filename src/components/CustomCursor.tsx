import { useEffect } from 'react';

export function CustomCursor() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.5;
    let cx = tx;
    let cy = ty;

    const onMove = (event: MouseEvent) => {
      tx = event.clientX;
      ty = event.clientY;
    };

    const animate = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      root.style.setProperty('--cx', `${cx.toFixed(2)}px`);
      root.style.setProperty('--cy', `${cy.toFixed(2)}px`);
      raf = window.requestAnimationFrame(animate);
    };

    const onPointerOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('a, button, .tilt-card')) {
        root.classList.add('cursor-hovering');
      } else {
        root.classList.remove('cursor-hovering');
      }
    };

    raf = window.requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMove);
    document.addEventListener('pointerover', onPointerOver);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerover', onPointerOver);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />
      <div className="cursor-trail" aria-hidden="true" />
    </>
  );
}
