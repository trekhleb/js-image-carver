/* eslint-disable no-await-in-loop, no-param-reassign, object-curly-newline */
import {
  Color,
  Coordinate,
  getPixel,
  setPixel,
} from './image';
import { wait } from './time';

export type Seam = Coordinate[];
export type EnergyMap = number[][];

type SeamMeta = {
  energy: number,
  coordinate: Coordinate,
  previous: Coordinate | null,
};

export type ImageSize = { w: number, h: number };

export type OnIterationArgs = {
  seam: Seam,
  img: ImageData,
  size: ImageSize,
  energyMap: EnergyMap,
  step: number,
  steps: number,
};

// If pixel's alpha is lower than the threshold this pixel is going to have
// the lowest energy and thus is a candidate for deletion.
export const ALPHA_DELETE_THRESHOLD = 244;

export const MAX_WIDTH_LIMIT = 1500;
export const MAX_HEIGHT_LIMIT = 1500;

const getPixelDeleteEnergy = (): number => {
  const numColors = 3;
  const maxColorDistance = 255;
  const numNeighbors = 2;
  const multiplier = 2;
  const maxSeamSize = Math.max(MAX_WIDTH_LIMIT, MAX_HEIGHT_LIMIT);
  return -1 * multiplier * numNeighbors * maxSeamSize * numColors * (maxColorDistance ** 2);
};

const matrix = <T>(w: number, h: number, filler: T): T[][] => {
  return new Array(h)
    .fill(null)
    .map(() => {
      return new Array(w).fill(filler);
    });
};

const getPixelEnergy = (left: Color | null, middle: Color, right: Color | null): number => {
  const [mR, mG, mB, mA] = middle;

  let lEnergy = 0;
  if (left) {
    const [lR, lG, lB] = left;
    lEnergy = (lR - mR) ** 2 + (lG - mG) ** 2 + (lB - mB) ** 2;
  }

  let rEnergy = 0;
  if (right) {
    const [rR, rG, rB] = right;
    rEnergy = (rR - mR) ** 2 + (rG - mG) ** 2 + (rB - mB) ** 2;
  }

  return mA > ALPHA_DELETE_THRESHOLD ? (lEnergy + rEnergy) : getPixelDeleteEnergy();
};

const getPixelEnergyH = (img: ImageData, { w }: ImageSize, { x, y }: Coordinate): number => {
  const left = (x - 1) >= 0 ? getPixel(img, { x: x - 1, y }) : null;
  const middle = getPixel(img, { x, y });
  const right = (x + 1) < w ? getPixel(img, { x: x + 1, y }) : null;
  return getPixelEnergy(left, middle, right);
};

const getPixelEnergyV = (img: ImageData, { h }: ImageSize, { x, y }: Coordinate): number => {
  const top = (y - 1) >= 0 ? getPixel(img, { x, y: y - 1 }) : null;
  const middle = getPixel(img, { x, y });
  const bottom = (y + 1) < h ? getPixel(img, { x, y: y + 1 }) : null;
  return getPixelEnergy(top, middle, bottom);
};

const calculateEnergyMapH = (img: ImageData, { w, h }: ImageSize): EnergyMap => {
  const energyMap: number[][] = matrix<number>(w, h, Infinity);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      energyMap[y][x] = getPixelEnergyH(img, { w, h }, { x, y });
    }
  }
  return energyMap;
};

const calculateEnergyMapV = (img: ImageData, { w, h }: ImageSize): EnergyMap => {
  const energyMap: number[][] = matrix<number>(w, h, Infinity);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      energyMap[y][x] = getPixelEnergyV(img, { w, h }, { x, y });
    }
  }
  return energyMap;
};

const reCalculateEnergyMapH = (
  img: ImageData,
  { w, h }: ImageSize,
  energyMap: EnergyMap,
  seam: Seam,
): EnergyMap => {
  seam.forEach(({ x: seamX, y: seamY }: Coordinate) => {
    // Deleting the seam from the energy map.
    for (let x = seamX; x < (w - 1); x += 1) {
      energyMap[seamY][x] = energyMap[seamY][x + 1];
    }
    // Recalculating the energy pixels around the deleted seam.
    energyMap[seamY][seamX] = getPixelEnergyH(img, { w, h }, { x: seamX, y: seamY });
  });
  return energyMap;
};

const reCalculateEnergyMapV = (
  img: ImageData,
  { w, h }: ImageSize,
  energyMap: EnergyMap,
  seam: Seam,
): EnergyMap => {
  seam.forEach(({ x: seamX, y: seamY }: Coordinate) => {
    // Deleting the seam from the energy map.
    for (let y = seamY; y < (h - 1); y += 1) {
      energyMap[y][seamX] = energyMap[y + 1][seamX];
    }
    // Recalculating the energy pixels around the deleted seam.
    energyMap[seamY][seamX] = getPixelEnergyV(img, { w, h }, { x: seamX, y: seamY });
  });
  return energyMap;
};

const findLowEnergySeamH = (energyMap: EnergyMap, { w, h }: ImageSize): Seam => {
  const seamsMap: (SeamMeta | null)[][] = matrix<SeamMeta | null>(w, h, null);

  // Populate the first row of the map.
  for (let x = 0; x < w; x += 1) {
    const y = 0;
    seamsMap[y][x] = {
      energy: energyMap[y][x],
      coordinate: { x, y },
      previous: null,
    };
  }

  // Populate the rest of the rows.
  for (let y = 1; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      // Find top adjacent cell with minimum energy.
      let minPrevEnergy = Infinity;
      let minPrevX: number = x;
      for (let i = (x - 1); i <= (x + 1); i += 1) {
        // @ts-ignore
        if (i >= 0 && i < w && seamsMap[y - 1][i].energy < minPrevEnergy) {
          // @ts-ignore
          minPrevEnergy = seamsMap[y - 1][i].energy;
          minPrevX = i;
        }
      }

      // Update the current cell.
      seamsMap[y][x] = {
        energy: minPrevEnergy + energyMap[y][x],
        coordinate: { x, y },
        previous: { x: minPrevX, y: y - 1 },
      };
    }
  }

  // Find where the minimum energy seam ends.
  let lastMinCoordinate: Coordinate | null = null;
  let minSeamEnergy = Infinity;
  for (let x = 0; x < w; x += 1) {
    const y = h - 1;
    // @ts-ignore
    if (seamsMap[y][x].energy < minSeamEnergy) {
      // @ts-ignore
      minSeamEnergy = seamsMap[y][x].energy;
      lastMinCoordinate = { x, y };
    }
  }

  // Find the minimal energy seam.
  const seam: Seam = [];
  if (!lastMinCoordinate) {
    return seam;
  }

  const { x: lastMinX, y: lastMinY } = lastMinCoordinate;

  let currentSeam = seamsMap[lastMinY][lastMinX];
  while (currentSeam) {
    seam.push(currentSeam.coordinate);
    const prevMinCoordinates = currentSeam.previous;
    if (!prevMinCoordinates) {
      currentSeam = null;
    } else {
      const { x: prevMinX, y: prevMinY } = prevMinCoordinates;
      currentSeam = seamsMap[prevMinY][prevMinX];
    }
  }

  return seam;
};

const findLowEnergySeamV = (energyMap: EnergyMap, { w, h }: ImageSize): Seam => {
  const seamsMap: (SeamMeta | null)[][] = matrix<SeamMeta | null>(w, h, null);

  // Populate the first column of the map.
  for (let y = 0; y < h; y += 1) {
    const x = 0;
    seamsMap[y][x] = {
      energy: energyMap[y][x],
      coordinate: { x, y },
      previous: null,
    };
  }

  // Populate the rest of the columns.
  for (let x = 1; x < w; x += 1) {
    for (let y = 0; y < h; y += 1) {
      // Find left adjacent cell with minimum energy.
      let minPrevEnergy = Infinity;
      let minPrevY: number = y;
      for (let i = (y - 1); i <= (y + 1); i += 1) {
        // @ts-ignore
        if (i >= 0 && i < h && seamsMap[i][x - 1].energy < minPrevEnergy) {
          // @ts-ignore
          minPrevEnergy = seamsMap[i][x - 1].energy;
          minPrevY = i;
        }
      }

      // Update the current cell.
      seamsMap[y][x] = {
        energy: minPrevEnergy + energyMap[y][x],
        coordinate: { x, y },
        previous: { x: x - 1, y: minPrevY },
      };
    }
  }

  // Find where the minimum energy seam ends.
  let lastMinCoordinate: Coordinate | null = null;
  let minSeamEnergy = Infinity;
  for (let y = 0; y < h; y += 1) {
    const x = w - 1;
    // @ts-ignore
    if (seamsMap[y][x].energy < minSeamEnergy) {
      // @ts-ignore
      minSeamEnergy = seamsMap[y][x].energy;
      lastMinCoordinate = { x, y };
    }
  }

  // Find the minimal energy seam.
  const seam: Seam = [];
  if (!lastMinCoordinate) {
    return seam;
  }

  const { x: lastMinX, y: lastMinY } = lastMinCoordinate;

  let currentSeam = seamsMap[lastMinY][lastMinX];
  while (currentSeam) {
    seam.push(currentSeam.coordinate);
    const prevMinCoordinates = currentSeam.previous;
    if (!prevMinCoordinates) {
      currentSeam = null;
    } else {
      const { x: prevMinX, y: prevMinY } = prevMinCoordinates;
      currentSeam = seamsMap[prevMinY][prevMinX];
    }
  }

  return seam;
};

const deleteSeamH = (img: ImageData, seam: Seam, { w }: ImageSize): void => {
  seam.forEach(({ x: seamX, y: seamY }: Coordinate) => {
    for (let x = seamX; x < (w - 1); x += 1) {
      const nextPixel = getPixel(img, { x: x + 1, y: seamY });
      setPixel(img, { x, y: seamY }, nextPixel);
    }
  });
};

const deleteSeamV = (img: ImageData, seam: Seam, { h }: ImageSize): void => {
  seam.forEach(({ x: seamX, y: seamY }: Coordinate) => {
    for (let y = seamY; y < (h - 1); y += 1) {
      const nextPixel = getPixel(img, { x: seamX, y: y + 1 });
      setPixel(img, { x: seamX, y }, nextPixel);
    }
  });
};

type ResizeAxisArgs = {
  img: ImageData,
  toSize: number,
  size: ImageSize,
  onIteration?: (args: OnIterationArgs) => Promise<void>,
};

type ResizeImageArgs = {
  img: ImageData,
  toWidth: number,
  toHeight: number,
  onIteration?: (args: OnIterationArgs) => Promise<void>,
};

const resizeImageWidth = async (args: ResizeAxisArgs): Promise<void> => {
  const { img, toSize, onIteration, size } = args;

  const pxToRemove = img.width - toSize;
  if (pxToRemove < 0) {
    throw new Error('Upsizing is not supported');
  }

  let energyMap: EnergyMap | null = null;
  let seam: Seam | null = null;

  for (let i = 0; i < pxToRemove; i += 1) {
    energyMap = energyMap && seam
      ? reCalculateEnergyMapH(img, size, energyMap, seam)
      : calculateEnergyMapH(img, size);

    seam = findLowEnergySeamH(energyMap, size);

    deleteSeamH(img, seam, size);

    if (onIteration) {
      await onIteration({
        energyMap,
        seam,
        img,
        size,
        step: i,
        steps: pxToRemove,
      });
    }

    size.w -= 1;

    await wait(1);
  }
};

const resizeImageHeight = async (args: ResizeAxisArgs): Promise<void> => {
  const { img, toSize, onIteration, size } = args;

  const pxToRemove = img.height - toSize;
  if (pxToRemove < 0) {
    throw new Error('Upsizing is not supported');
  }

  let energyMap: EnergyMap | null = null;
  let seam: Seam | null = null;

  for (let i = 0; i < pxToRemove; i += 1) {
    energyMap = energyMap && seam
      ? reCalculateEnergyMapV(img, size, energyMap, seam)
      : calculateEnergyMapV(img, size);

    seam = findLowEnergySeamV(energyMap, size);

    deleteSeamV(img, seam, size);

    if (onIteration) {
      await onIteration({
        energyMap,
        seam,
        img,
        size,
        step: i,
        steps: pxToRemove,
      });
    }

    size.h -= 1;

    await wait(1);
  }
};

export const resizeImage = async (args: ResizeImageArgs): Promise<void> => {
  const {
    img,
    toWidth,
    toHeight,
    onIteration,
  } = args;

  const pxToRemoveH = img.width - toWidth;
  const pxToRemoveV = img.height - toHeight;

  const size: ImageSize = { w: img.width, h: img.height };

  const globalSteps = pxToRemoveH + pxToRemoveV;
  let globalStep = 0;

  const onResizeIteration = async (onIterationArgs: OnIterationArgs): Promise<void> => {
    const {
      seam,
      img: onIterationImg,
      size: onIterationSize,
      energyMap,
    } = onIterationArgs;

    globalStep += 1;

    if (!onIteration) {
      return;
    }

    await onIteration({
      seam,
      img: onIterationImg,
      size: onIterationSize,
      energyMap,
      step: globalStep,
      steps: globalSteps,
    });
  };

  await resizeImageWidth({ img, toSize: toWidth, onIteration: onResizeIteration, size });
  await resizeImageHeight({ img, toSize: toHeight, onIteration: onResizeIteration, size });
};
