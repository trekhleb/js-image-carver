import React, { ChangeEvent } from 'react';

export type InputProps = {
  onChange?: (value: string) => void,
  className?: string,
  disabled?: boolean,
  value?: string | ReadonlyArray<string> | number,
};

const Input = (props: InputProps): React.ReactElement => {
  const {
    disabled = false,
    className = '',
    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    onChange = (): void => {},
    value,
    ...rest
  } = props;

  const disabledClasses = disabled ? 'border-gray-300 text-gray-500 cursor-not-allowed' : '';
  const defaultClasses = 'border border-solid border-black rounded px-2 py-1 text-sm';
  const classes = `${defaultClasses} ${disabledClasses} ${className}`;

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <div className="flex flex-row justify-center items-center">
      <input
        disabled={disabled}
        onChange={onInputChange}
        className={classes}
        value={value}
        {...rest}
      />
    </div>
  );
};

export default Input;
