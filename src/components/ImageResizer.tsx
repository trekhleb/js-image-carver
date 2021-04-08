import React, { useEffect, useRef, useState } from 'react';
import { ImShrink2 } from '@react-icons/all-files/im/ImShrink2';
import { AiOutlineClear } from '@react-icons/all-files/ai/AiOutlineClear';
import { FaRegHandPointer } from '@react-icons/all-files/fa/FaRegHandPointer';

import {
  EnergyMap as EnergyMapType,
  Seam,
  OnIterationArgs,
  ImageSize,
  resizeImage,
  ALPHA_DELETE_THRESHOLD,
  MAX_WIDTH_LIMIT,
  MAX_HEIGHT_LIMIT,
} from '../utils/contentAwareResizer';
import EnergyMap from './EnergyMap';
import Seams from './Seams';
import defaultImgSrc from '../assets/02.jpg';
import Button, { BUTTON_KIND_SECONDARY } from './Button';
import FileSelector from './FileSelector';
import Checkbox from './Checkbox';
import Progress from './Progress';
import Input from './Input';
import FadeIn from './FadeIn';
import Mask from './Mask';
import { Coordinate, getPixel, setPixel } from '../utils/image';

const defaultWidthScale = 50;
const defaultHeightScale = 70;
const minScale = 1;
const maxScale = 100;
const maxWidthLimit = MAX_WIDTH_LIMIT;
const maxHeightLimit = MAX_HEIGHT_LIMIT;

type ImageResizerProps = {
  withSeam?: boolean,
  withEnergyMap?: boolean,
};

const ImageResizer = (props: ImageResizerProps): React.ReactElement => {
  const {
    withSeam = false,
    withEnergyMap = false,
  } = props;

  const [imgAuthor, setImgAuthor] = useState<string | null>('ian dooley');
  const [imgAuthorURL, setImgAuthorURL] = useState<string | null>(
    'https://unsplash.com/@sadswim?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText',
  );

  const [useNaturalSize, setUseNaturalSize] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>(defaultImgSrc);
  const [resizedImgSrc, setResizedImgSrc] = useState<string | null>(null);
  const [energyMap, setEnergyMap] = useState<EnergyMapType | null>(null);
  const [originalImgSize, setOriginalImgSize] = useState<ImageSize | null>(null);
  const [originalImgViewSize, setOriginalImgViewSize] = useState<ImageSize | null>(null);
  const [workingImgSize, setWorkingImgSize] = useState<ImageSize | null>(null);
  const [seams, setSeams] = useState<Seam[] | null>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [maskImgData, setMaskImgData] = useState<ImageData | null>(null);
  const [maskRevision, setMaskRevision] = useState<number>(0);
  const [toWidthScale, setToWidthScale] = useState<number>(defaultWidthScale);
  const [toWidthScaleString, setToWidthScaleString] = useState<string | undefined>(`${defaultWidthScale}`);
  const [toHeightScale, setToHeightScale] = useState<number>(defaultHeightScale);
  const [toHeightScaleString, setToHeightScaleString] = useState<string | undefined>(`${defaultHeightScale}`);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onUseOriginalSizeChange = (state: boolean): void => {
    setUseNaturalSize(state);
  };

  const onReset = (): void => {
    setResizedImgSrc(null);
    setSeams(null);
    setWorkingImgSize(null);
    setEnergyMap(null);
    setProgress(0);
    setOriginalImgViewSize(null);
  };

  const onFileSelect = (files: FileList | null): void => {
    if (!files || !files.length) {
      return;
    }
    setImgAuthor(null);
    setImgAuthorURL(null);
    onReset();
    const imageURL = URL.createObjectURL(files[0]);
    setImageSrc(imageURL);
  };

  const onWidthSizeChange = (size: string | undefined): void => {
    const radix = 10;
    const scale = Math.max(Math.min(parseInt(size || '0', radix), maxScale), minScale);
    if (size) {
      setToWidthScaleString(`${scale}`);
    } else {
      setToWidthScaleString(size);
    }
    setToWidthScale(scale);
  };

  const onHeightSizeChange = (size: string | undefined): void => {
    const radix = 10;
    const scale = Math.max(Math.min(parseInt(size || '0', radix), maxScale), minScale);
    if (size) {
      setToHeightScaleString(`${scale}`);
    } else {
      setToHeightScaleString(size);
    }
    setToHeightScale(scale);
  };

  const onFinish = (): void => {
    if (!canvasRef.current) {
      return;
    }
    const imageType = 'image/png';
    canvasRef.current.toBlob((blob: Blob | null): void => {
      if (!blob) {
        return;
      }
      const imgUrl = URL.createObjectURL(blob);
      setResizedImgSrc(imgUrl);
      setIsResizing(false);
    }, imageType);
  };

  const onClearMask = (): void => {
    setMaskRevision(maskRevision + 1);
  };

  const onMaskDrawEnd = (imgData: ImageData): void => {
    setMaskImgData(imgData);
  };

  const applyMask = (img: ImageData): void => {
    if (!maskImgData) {
      return;
    }

    const wRatio = maskImgData.width / img.width;
    const hRatio = maskImgData.height / img.height;

    const imgXYtoMaskXY = ({ x: imgX, y: imgY }: Coordinate): Coordinate => {
      return {
        x: Math.floor(imgX * wRatio),
        y: Math.floor(imgY * hRatio),
      };
    };

    for (let y = 0; y < img.height; y += 1) {
      for (let x = 0; x < img.width; x += 1) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [mR, mG, mB, mA] = getPixel(
          maskImgData,
          imgXYtoMaskXY({ x, y }),
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [iR, iG, iB, iA] = getPixel(img, { x, y });
        if (mA) {
          setPixel(img, { x, y }, [iR, iG, iB, ALPHA_DELETE_THRESHOLD]);
        }
      }
    }
  };

  const onIteration = async (args: OnIterationArgs): Promise<void> => {
    const {
      seam,
      img,
      energyMap: nrgMap,
      size: { w, h },
      step,
      steps,
    } = args;

    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = w;
    canvas.height = h;

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.putImageData(img, 0, 0, 0, 0, w, h);

    setEnergyMap(nrgMap);
    setSeams([seam]);
    setWorkingImgSize({ w, h });
    setProgress(step / steps);
  };

  const onResize = (): void => {
    const srcImg: HTMLImageElement | null = imgRef.current;
    if (!srcImg) {
      return;
    }
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) {
      return;
    }

    onReset();
    setIsResizing(true);

    let w = useNaturalSize ? srcImg.naturalWidth : srcImg.width;
    let h = useNaturalSize ? srcImg.naturalHeight : srcImg.height;
    const ratio = w / h;

    setOriginalImgViewSize({
      w: srcImg.width,
      h: srcImg.height,
    });

    if (w > maxWidthLimit) {
      w = maxWidthLimit;
      h = Math.floor(w / ratio);
    }

    if (h > maxHeightLimit) {
      h = maxHeightLimit;
      w = Math.floor(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.drawImage(srcImg, 0, 0, w, h);

    const img: ImageData = ctx.getImageData(0, 0, w, h);

    applyMask(img);

    const toWidth = Math.floor((toWidthScale * w) / 100);
    const toHeight = Math.floor((toHeightScale * h) / 100);

    resizeImage({
      img,
      toWidth,
      toHeight,
      onIteration,
    }).then(() => {
      onFinish();
    });
  };

  useEffect(() => {
    const srcImg: HTMLImageElement | null = imgRef.current;
    if (!srcImg) {
      return;
    }
    srcImg.addEventListener('load', () => {
      if (!imgRef.current) {
        return;
      }
      setOriginalImgSize({
        w: imgRef.current.naturalWidth,
        h: imgRef.current.naturalHeight,
      });
      setOriginalImgViewSize({
        w: imgRef.current.width,
        h: imgRef.current.height,
      });
    });
  }, []);

  useEffect(() => {
    function updateSize(): void {
      if (!imgRef.current) {
        return;
      }
      setOriginalImgViewSize({
        w: imgRef.current.width,
        h: imgRef.current.height,
      });
    }
    window.addEventListener('resize', updateSize);
    return (): void => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const imgAuthorLink = imgAuthor && imgAuthorURL ? (
    <div className="text-xs text-gray-400 mt-2 flex justify-center items-center font-light">
      <div className="mr-1">
        Photo by
      </div>
      <a
        href={imgAuthorURL}
        style={{ color: '#aaa', fontWeight: 300 }}
        target="_blank"
        rel="noreferrer"
      >
        {imgAuthor}
      </a>
    </div>
  ) : null;

  const seamsCanvas = withSeam && workingImgSize && seams ? (
    <div style={{ marginTop: `-${workingImgSize.h}px` }}>
      <Seams seams={seams} width={workingImgSize.w} height={workingImgSize.h} />
    </div>
  ) : null;

  const originalImageSizeText = originalImgSize ? (
    <sup className="text-xs text-gray-400 whitespace-nowrap">
      {`${originalImgSize.w} x ${originalImgSize.h} px`}
    </sup>
  ) : null;

  const maskControls = (
    <div>
      <Button
        onClick={onClearMask}
        disabled={isResizing || !maskImgData}
        kind={BUTTON_KIND_SECONDARY}
        title="Clear mask"
      >
        <AiOutlineClear size={14} />
      </Button>
    </div>
  );

  const mask = originalImgViewSize ? (
    <div className="flex flex-col" style={{ marginTop: `-${originalImgViewSize.h}px` }}>
      <Mask
        width={originalImgViewSize.w}
        height={originalImgViewSize.h}
        disabled={isResizing}
        onDrawEnd={onMaskDrawEnd}
        revision={maskRevision}
      />
      <div className="flex flex-row justify-end" style={{ marginTop: '-36px', zIndex: 100 }}>
        <div className="mr-1">
          {maskControls}
        </div>
      </div>
    </div>
  ) : null;

  const originalImage = (
    <FadeIn>
      <div className="flex flex-row justify-center items-center mb-1 sm:mb-0">
        <div className="flex-1 sm:flex sm:flex-row sm:items-center">
          <div className="sm:flex-1">
            <b>Original image</b> {originalImageSizeText}
          </div>
          <div className="text-xs text-gray-400 flex flex-row items-center justify-self-end">
            <div className="mr-1">
              <FaRegHandPointer size={12} />
            </div>
            <div>
              Mask to remove
            </div>
          </div>
        </div>
      </div>
      <img src={imageSrc} alt="Original" ref={imgRef} style={{ margin: 0 }} />
      {mask}
      {imgAuthorLink}
    </FadeIn>
  );

  const workingImageScrollableText = (
    workingImgSize?.w && originalImgViewSize?.w && workingImgSize.w > originalImgViewSize.w
  ) ? <span className="text-xs text-gray-400 ml-4">↔︎ scrollable</span> : null;

  const workingImageSizeText = workingImgSize ? (
    <sup className="text-xs text-gray-400 whitespace-nowrap">
      {`${workingImgSize.w} x ${workingImgSize.h} px`}
    </sup>
  ) : null;

  const workingImage = (
    <FadeIn className={`mb-6 ${resizedImgSrc || !energyMap ? 'hidden' : ''}`}>
      <div><b>Resized image</b> {workingImageSizeText} {workingImageScrollableText}</div>
      <div className="overflow-scroll">
        <canvas ref={canvasRef} />
        {seamsCanvas}
      </div>
    </FadeIn>
  );

  const resultImageSizeText = workingImgSize ? (
    <sup className="text-xs text-gray-400 whitespace-nowrap">
      {`${workingImgSize.w} x ${workingImgSize.h} px`}
    </sup>
  ) : null;

  const resultImage = workingImgSize && resizedImgSrc ? (
    <FadeIn className="mb-6">
      <div><b>Resized image</b> {resultImageSizeText}</div>
      <img src={resizedImgSrc} width={workingImgSize.w} height={workingImgSize.h} alt="Resized" style={{ margin: 0 }} />
    </FadeIn>
  ) : null;

  const debugEnergyMap = withEnergyMap && workingImgSize ? (
    <FadeIn className="mb-6">
      <div><b>Energy map</b></div>
      <EnergyMap energyMap={energyMap} width={workingImgSize.w} height={workingImgSize.h} />
      {seamsCanvas}
    </FadeIn>
  ) : null;

  const resizerControls = (
    <div className="flex flex-col justify-start items-start mb-1">

      <div className="mb-3 flex flex-row">
        <div className="mr-2">
          <FileSelector
            onSelect={onFileSelect}
            disabled={isResizing}
            accept="image/png,image/jpeg"
          >
            Choose image
          </FileSelector>
        </div>

        <div>
          <Button
            onClick={onResize}
            disabled={isResizing || !toWidthScaleString}
            startEnhancer={<ImShrink2 size={14} />}
          >
            Resize
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row">
        <div className="mb-2 mr-6 flex flex-row items-center">
          <div className="text-xs mr-1">Width</div>
          <Input
            onChange={onWidthSizeChange}
            disabled={isResizing}
            // @ts-ignore
            type="number"
            min={minScale}
            max={maxScale}
            className="w-14 text-center"
            value={toWidthScaleString}
          />
          <div className="text-xs ml-1 mr-4">%</div>

          <div className="text-xs mr-1">Height</div>
          <Input
            onChange={onHeightSizeChange}
            disabled={isResizing}
            // @ts-ignore
            type="number"
            min={minScale}
            max={maxScale}
            className="w-14 text-center"
            value={toHeightScaleString}
          />
          <div className="text-xs ml-1">%</div>
        </div>

        <div className="mb-2">
          <Checkbox disabled={isResizing} onChange={onUseOriginalSizeChange}>
            <span className="text-xs">
              Higher quality <span className="text-gray-400">(takes longer)</span>
            </span>
          </Checkbox>
        </div>
      </div>

    </div>
  );

  const progressBar = (
    <div className="mb-6">
      <Progress progress={progress} />
    </div>
  );

  return (
    <>
      {resizerControls}
      {progressBar}
      {workingImage}
      {resultImage}
      {debugEnergyMap}
      {originalImage}
    </>
  );
};

export default ImageResizer;
