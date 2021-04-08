import React from 'react';

import './FadeIn.css';

type FadeInProps = {
  children: React.ReactNode,
  className?: string,
};

const FadeIn = (props: FadeInProps): React.ReactElement => {
  const { children, className = '' } = props;

  return (
    <div className={`custom-fade-in-opacity ${className}`}>
      {children}
    </div>
  );
};

export default FadeIn;
