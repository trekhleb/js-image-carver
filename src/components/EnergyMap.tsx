import React, { useRef, useEffect } from 'react';
import { setPixel } from '../utils/image';
import { EnergyMap as EnergyMapType } from '../utils/contentAwareResizer';

type EnergyMapProps = {
  energyMap: EnergyMapType | null,
  width: number,
  height: number,
  className?: string,
};

const normalizeEnergy = (
  energy: number,
  maxEnergy: number,
  maxNormalizedEnergy: number,
): number => {
  return Math.floor((energy / maxEnergy) * maxNormalizedEnergy);
};

const getMaxEnergy = (
  energyMap: EnergyMapType,
  width: number,
  height: number,
): number => {
  let maxEnergy = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      maxEnergy = Math.max(maxEnergy, energyMap[y][x]);
    }
  }

  return maxEnergy;
};

const normalizeEnergyMap = (
  energyMap: EnergyMapType,
  width: number,
  height: number,
  maxNormalizedEnergy = 255,
): number[][] => {
  const maxEnergy = getMaxEnergy(energyMap, width, height);

  const normalizedMap = new Array(height)
    .fill(null)
    .map(() => {
      return new Array(width).fill(Infinity);
    });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      normalizedMap[y][x] = normalizeEnergy(energyMap[y][x], maxEnergy, maxNormalizedEnergy);
    }
  }

  return normalizedMap;
};

const EnergyMap = (props: EnergyMapProps): React.ReactElement => {
  const {
    energyMap,
    className,
    width,
    height,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!energyMap || !energyMap.length || !energyMap[0].length) {
      return;
    }
    const energyCanvas: HTMLCanvasElement | null = canvasRef.current;
    if (!energyCanvas) {
      return;
    }
    const energyCtx: CanvasRenderingContext2D | null = energyCanvas.getContext('2d');
    if (!energyCtx) {
      return;
    }

    energyCanvas.width = width;
    energyCanvas.height = height;

    const imgData: ImageData = energyCtx.getImageData(0, 0, width, height);

    const normalizedEnergyMap = normalizeEnergyMap(energyMap, width, height);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const norm = normalizedEnergyMap[y][x];
        setPixel(imgData, { x, y }, [norm, norm, norm, 255]);
      }
    }

    energyCtx.putImageData(imgData, 0, 0);
  }, [energyMap, width, height]);

  return (
    <canvas ref={canvasRef} className={className} />
  );
};

export default EnergyMap;
