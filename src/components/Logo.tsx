import React from 'react';

import { routes } from '../constants/routes';
import { brandName } from '../constants/siteMeta';
import type { Link as LinkType } from '../types/Link';
import HyperLink from './HyperLink';

const Logo = (): React.ReactElement => {
  const link: LinkType = {
    url: routes.home.path,
  };
  return (
    <div>
      <HyperLink link={link} className="font-extrabold text-sm tracking-widest uppercase">
        {brandName}
      </HyperLink>
    </div>
  );
};

export default Logo;
