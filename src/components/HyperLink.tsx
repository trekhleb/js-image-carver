import React from 'react';

import type { Link as LinkType } from '../types/Link';

export type HyperLinkProps = {
  link: LinkType,
  children: React.ReactNode,
  className?: string,
  hoverClassName?: string | null | undefined,
  startEnhancer?: React.ReactNode,
  formatted?: boolean,
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void,
};

const HyperLink = (props: HyperLinkProps): React.ReactElement | null => {
  const {
    link,
    children,
    className = '',
    hoverClassName = null,
    startEnhancer = null,
    formatted = true,
    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    onClick = (): void => {},
  } = props;

  if (!link?.url) {
    return null;
  }

  const hoverClasses = hoverClassName || 'hover:text-red-600';

  const commonClasses = formatted
    ? `transition duration-200 ease-in-out whitespace-nowrap flex flex-row items-center ${hoverClasses}`
    : '';

  const caption = link?.caption || undefined;

  const separator = startEnhancer ? (
    <span className="w-1" />
  ) : null;

  return (
    <a
      href={link.url}
      className={`${commonClasses} ${className}`}
      onClick={onClick}
      title={caption}
      style={{ fontWeight: 400 }}
    >
      {formatted && startEnhancer}
      {formatted && separator}
      {children}
    </a>
  );
};

export default HyperLink;
