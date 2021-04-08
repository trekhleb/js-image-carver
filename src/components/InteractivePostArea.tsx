import React from 'react';
import ErrorBoundary from './ErrorBoundary';

type InteractivePostAreaProps = {
  children: React.ReactNode,
  title?: string | null,
  className?: string,
};

const InteractivePostArea = (props: InteractivePostAreaProps): React.ReactElement | null => {
  const { children, title, className = '' } = props;

  if (!children) {
    return null;
  }

  const titleElement = title ? (
    <div className="text-xs font-light">
      {title}
    </div>
  ) : null;

  return (
    <ErrorBoundary>
      {titleElement}
      <div className={`p-6 border border-dashed border-gray-300 rounded-md overflow-hidden ${className}`}>
        {children}
      </div>
    </ErrorBoundary>
  );
};

export default InteractivePostArea;
