import React, { useRef } from 'react';

export type CheckboxProps = {
  children: React.ReactNode,
  onChange?: (state: boolean) => void,
  className?: string,
  disabled?: boolean,
};

const Checkbox = (props: CheckboxProps): React.ReactElement => {
  const {
    children,
    className = '',
    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    onChange = (): void => {},
    disabled = false,
  } = props;

  const checkboxRef = useRef<HTMLInputElement>(null);

  const disabledClasses = disabled ? 'cursor-not-allowed text-gray-500' : '';
  const defaultClasses = 'flex items-center cursor-pointer';
  const classes = `${defaultClasses} ${disabledClasses} ${className}`;

  const onCheckboxChange = (): void => {
    if (!checkboxRef.current) {
      return;
    }
    onChange(checkboxRef.current.checked);
  };

  /* eslint-disable jsx-a11y/label-has-associated-control */
  return (
    <label className={classes}>
      <input
        type="checkbox"
        disabled={disabled}
        onChange={onCheckboxChange}
        ref={checkboxRef}
      />
      <div className="ml-2">{children}</div>
    </label>
  );
};

export default Checkbox;
