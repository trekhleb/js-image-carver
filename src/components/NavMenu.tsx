import React from 'react';

import { Route, routes } from '../constants/routes';
import { Link } from '../types/Link';
import HyperLink from './HyperLink';

const NavMenu = (): React.ReactElement => {
  const links = Object.values(routes).map((route: Route): React.ReactElement => {
    const link: Link = { url: route.path };
    return (
      <li key={route.path} className="ml-5">
        <HyperLink
          link={link}
          className="uppercase text-xs"
        >
          {route.name}
        </HyperLink>
      </li>
    );
  });

  return (
    <ul className="flex flex-row">
      {links}
    </ul>
  );
};

export default NavMenu;
