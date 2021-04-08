import React, { CSSProperties } from 'react';

type ButtonKind = 'primary' | 'secondary';

export const BUTTON_KIND_PRIMARY: ButtonKind = 'primary';
export const BUTTON_KIND_SECONDARY: ButtonKind = 'secondary';

export type ButtonProps = {
  children: React.ReactNode,
  onClick?: () => void,
  className?: string,
  disabled?: boolean,
  title?: string | undefined,
  startEnhancer?: React.ReactNode,
  style?: CSSProperties,
  kind?: ButtonKind,
};

const Button = (props: ButtonProps): React.ReactElement => {
  const {
    children,
    className = '',
    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    onClick = (): void => {},
    disabled = false,
    title = undefined,
    startEnhancer = null,
    style = {},
    kind = BUTTON_KIND_PRIMARY,
  } = props;

  const defaultClasses = ' transition duration-200 ease-in-out flex flex-row items-center uppercase font-medium text-xs tracking-wider';

  const disabledClasses: Record<ButtonKind, string> = {
    [BUTTON_KIND_PRIMARY]: 'cursor-not-allowed bg-white text-gray-500 hover:bg-white hover:text-gray-500 border-gray-300',
    [BUTTON_KIND_SECONDARY]: 'cursor-not-allowed bg-white text-gray-500 hover:bg-white hover:text-gray-500 border-gray-300',
  };

  const kindClasses: Record<ButtonKind, string> = {
    [BUTTON_KIND_PRIMARY]: 'hover:bg-white hover:text-black py-2 px-3 rounded shadow-sm border border-solid border-white hover:border-gray-400 bg-black text-white',
    [BUTTON_KIND_SECONDARY]: 'bg-white text-black py-2 px-3 rounded shadow-sm border border-solid hover:border-white border-gray-400 hover:bg-black hover:text-white',
  };

  const classes = `${defaultClasses} ${kindClasses[kind]} ${disabled ? disabledClasses[kind] : ''} ${className}`;

  const separator = startEnhancer ? (
    <span className="w-2" />
  ) : null;

  return (
    <button
      className={classes}
      onClick={onClick}
      type="button"
      disabled={disabled}
      title={title}
      style={style}
    >
      {startEnhancer}
      {separator}
      {children}
    </button>
  );
};

export default Button;
