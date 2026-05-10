import { type MouseEvent, type PropsWithChildren, useRef } from 'react';

type MouseTiltProps = PropsWithChildren<{
  className?: string;
}>;

export function MouseTilt({ className, children }: MouseTiltProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 12;
    const rotateX = (0.5 - py) * 10;

    node.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
    node.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
    node.style.setProperty('--sx', `${(px * 100).toFixed(2)}%`);
    node.style.setProperty('--sy', `${(py * 100).toFixed(2)}%`);
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--rx', '0deg');
    node.style.setProperty('--ry', '0deg');
    node.style.setProperty('--sx', '50%');
    node.style.setProperty('--sy', '50%');
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </div>
  );
}
