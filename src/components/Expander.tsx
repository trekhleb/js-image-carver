import React, { SyntheticEvent, useState } from 'react';

import HyperLink from './HyperLink';

/* eslint-disable @typescript-eslint/no-explicit-any */
type ExpanderProps = {
  items: any[],
  onRender: (item: any, index: number) => React.ReactElement,
  toHide?: (item: any, index: number) => boolean,
  className?: string,
  itemClassName?: string,
  expandable?: boolean,
};

const Expander = (props: ExpanderProps): React.ReactElement | null => {
  const {
    items,
    onRender,
    className = '',
    itemClassName = '',
    toHide = (): boolean => false,
    expandable = true,
  } = props;

  const [expanded, setExpanded] = useState(false);

  if (!items || !items.length) {
    return null;
  }

  const toggle = (event: SyntheticEvent): void => {
    event.preventDefault();
    setExpanded(!expanded);
  };

  let somethingToHide = false;

  const filteredItems = items
    .filter((item: any, index: number) => {
      const hide = !toHide(item, index);
      if (!hide) {
        somethingToHide = true;
      }
      return expanded || hide;
    })
    .map((item: any, index: number) => onRender(item, index))
    .map((child: React.ReactElement, index: number) => {
      const itemDefaultClasses = 'flex flex-row items-center last:mr-0';
      const itemClasses = `${itemDefaultClasses} ${itemClassName}`;
      /* eslint-disable react/no-array-index-key */
      return (
        <li className={itemClasses} key={index}>
          {child}
        </li>
      );
    });

  /* eslint-disable jsx-a11y/anchor-is-valid */
  const moreLessButton = somethingToHide && expandable ? (
    <li className="flex flex-row items-center mb-2">
      <HyperLink
        link={{ url: '#', caption: expanded ? 'Show less' : 'Show more' }}
        className="text-xs font-light"
        onClick={toggle}
      >
        {expanded ? '- less' : '+ more'}
      </HyperLink>
    </li>
  ) : null;

  const defaultClasses = 'flex flex-row flex-wrap';
  const classes = `${defaultClasses} ${className}`;

  return (
    <ul className={classes}>
      {filteredItems}
      {moreLessButton}
    </ul>
  );
};

export default Expander;
