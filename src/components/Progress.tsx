import React, { CSSProperties } from 'react';

type ZeroToOne = number;

export type CheckboxProps = {
  progress: ZeroToOne,
};

const Progress = (props: CheckboxProps): React.ReactElement => {
  const { progress } = props;

  const progressPercentage = Math.min(Math.ceil(100 * progress), 100);
  const barStyle: CSSProperties = {
    width: `${progressPercentage}%`,
    transition: 'width 0.5s',
  };

  return (
    <div className="bg-gray-100 h-0.5 overflow-hidden flex flex-row justify-start items-center rounded">
      <div className="bg-black w-36 h-full transition duration-500 ease-in-out rounded transition" style={barStyle} />
    </div>
  );
};

export default Progress;
