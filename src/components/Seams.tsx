import React, { useRef, useEffect } from 'react';
import { Seam } from '../utils/contentAwareResizer';
import { Coordinate } from '../utils/image';

type SeamProps = {
  seams: Seam[],
  width: number,
  height: number,
  className?: string,
};

const Seams = (props: SeamProps): React.ReactElement => {
  const {
    seams,
    width,
    height,
    className = '',
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!seams || !seams.length || !seams[0]) {
      return;
    }
    const seamsCanvas: HTMLCanvasElement | null = canvasRef.current;
    if (!seamsCanvas) {
      return;
    }
    const seamsCtx: CanvasRenderingContext2D | null = seamsCanvas.getContext('2d');
    if (!seamsCtx) {
      return;
    }

    seamsCanvas.width = width;
    seamsCanvas.height = height;

    seamsCtx.fillStyle = 'rgba(255, 255, 255, 1)';
    seams[0].forEach(({ x, y }: Coordinate) => {
      seamsCtx.fillRect(x, y, 1, 1);
    });
  }, [seams, width, height]);

  return (
    <canvas ref={canvasRef} className={className} />
  );
};

export default Seams;
