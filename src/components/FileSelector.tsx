import React, { ChangeEvent } from 'react';
import { FaFileImage } from '@react-icons/all-files/fa/FaFileImage';
import Button from './Button';

type FileSelectorProps = {
  onSelect: (files: FileList | null) => void;
  accept?: string, // i.e. 'image/png,image/jpeg'
  capture?: 'user' | 'environment',
  multiple?: boolean,
  children: React.ReactNode,
  disabled?: boolean,
};

const FileSelector = (props: FileSelectorProps): React.ReactElement => {
  const {
    onSelect,
    accept,
    capture,
    multiple = false,
    disabled = false,
    children,
  } = props;

  const onChange = (event: ChangeEvent): void => {
    const { files } = (event.target as HTMLInputElement);
    onSelect(files);
  };

  const icon = (
    <div className="mr-2">
      <FaFileImage size={14} />
    </div>
  );

  const disabledClasses = disabled ? 'cursor-not-allowed' : '';

  /* eslint-disable jsx-a11y/label-has-associated-control */
  return (
    <Button style={{ padding: 0 }} disabled={disabled}>
      <label className={`cursor-pointer py-2 px-3 flex uppercase font-medium text-xs tracking-wider ${disabledClasses}`}>
        <input
          type="file"
          accept={accept}
          capture={capture}
          onChange={onChange}
          multiple={multiple}
          className="hidden"
          disabled={disabled}
        />
        {icon}
        {children}
      </label>
    </Button>
  );
};

export default FileSelector;
