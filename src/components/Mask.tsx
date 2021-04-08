/* eslint-disable @typescript-eslint/no-empty-function */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const defaultBackgroundColor = 'rgba(0, 0, 0, 0)';

type MouseCoordinate = {
  x: number,
  y: number,
};

type MaskProps = {
  disabled?: boolean,
  width?: number,
  height?: number,
  lineWidth?: number,
  lineJoin?: CanvasLineJoin,
  lineColor?: string,
  backgroundColor?: string,
  revision?: number,
  onDrawEnd?: (imageData: ImageData) => void,
};

const Mask = (props: MaskProps): React.ReactElement => {
  const {
    disabled = false,
    width = 200,
    height = 200,
    lineColor = 'rgba(255, 0, 0, 1)',
    lineWidth = 16,
    lineJoin = 'round',
    backgroundColor = defaultBackgroundColor,
    revision = 0,
    onDrawEnd: onDrawEndCallback,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<MouseCoordinate | null>(null);

  const getCoordinates = (event: MouseEvent): MouseCoordinate | null => {
    if (!canvasRef.current) {
      return null;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop,
    };
  };

  const startPaint = useCallback((event: MouseEvent) => {
    if (disabled) {
      return;
    }
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setMousePosition(coordinates);
      setIsPainting(true);
    }
  }, [disabled]);

  const paint = useCallback(
    (event: MouseEvent) => {
      const drawLine = (
        originalMousePosition: MouseCoordinate,
        newMousePosition: MouseCoordinate,
      ): void => {
        if (!canvasRef.current || disabled) {
          return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
          context.strokeStyle = lineColor;
          context.lineJoin = lineJoin;
          context.lineWidth = lineWidth;
          context.beginPath();
          context.moveTo(originalMousePosition.x, originalMousePosition.y);
          context.lineTo(newMousePosition.x, newMousePosition.y);
          context.closePath();
          context.stroke();
        }
      };

      if (isPainting) {
        const newMousePosition = getCoordinates(event);
        if (mousePosition && newMousePosition) {
          drawLine(mousePosition, newMousePosition);
          setMousePosition(newMousePosition);
        }
      }
    },
    [isPainting, mousePosition, lineColor, lineJoin, lineWidth, disabled],
  );

  const exitPaint = useCallback(() => {
    const onDrawEnd = (): void => {
      if (!canvasRef.current || disabled) {
        return;
      }

      const canvas: HTMLCanvasElement = canvasRef.current;
      const context = canvas.getContext('2d');

      // Call a callback.
      if (onDrawEndCallback && context) {
        onDrawEndCallback(
          context.getImageData(0, 0, canvas.width, canvas.height),
        );
      }
    };

    onDrawEnd();
    setIsPainting(false);
    setMousePosition(null);
  }, [onDrawEndCallback, disabled]);

  // Effect for MouseDown.
  useEffect(() => {
    if (!canvasRef.current) {
      return (): void => {};
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mousedown', startPaint);
    // @ts-ignore
    canvas.addEventListener('touchstart', startPaint);

    return (): void => {
      canvas.removeEventListener('mousedown', startPaint);
      // @ts-ignore
      canvas.removeEventListener('touchstart', startPaint);
    };
  }, [startPaint]);

  // Effect for MouseMove.
  useEffect(() => {
    if (!canvasRef.current) {
      return (): void => {};
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mousemove', paint);
    // @ts-ignore
    canvas.addEventListener('touchmove', paint);

    return (): void => {
      canvas.removeEventListener('mousemove', paint);
      // @ts-ignore
      canvas.removeEventListener('touchmove', paint);
    };
  }, [paint]);

  // Effect for MouseUp and MouseLeave.
  useEffect(() => {
    if (!canvasRef.current) {
      return (): void => {};
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mouseup', exitPaint);
    canvas.addEventListener('mouseleave', exitPaint);
    canvas.addEventListener('touchend', exitPaint);
    canvas.addEventListener('touchcancel', exitPaint);

    return (): void => {
      canvas.removeEventListener('mouseup', exitPaint);
      canvas.removeEventListener('mouseleave', exitPaint);
      canvas.removeEventListener('touchend', exitPaint);
      canvas.removeEventListener('touchcancel', exitPaint);
    };
  }, [exitPaint]);

  // Effect for filling a canvases with color.
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [backgroundColor]);

  // Effect to cleanup the canvas.
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = backgroundColor;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [revision, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ touchAction: 'none' }}
    />
  );
};

export default Mask;
