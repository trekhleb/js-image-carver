import React from 'react';

import Row from './Row';
import HyperLink from './HyperLink';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { gitHubRepoURL } from '../constants/links';

type FooterProps = {
  className?: string,
};

const Footer = (props: FooterProps): React.ReactElement => {
  const { className = '' } = props;

  return (
    <footer className={`${className}`}>
      <Row responsive>
        <div
          style={{ flex: 1 }}
          className="flex flex-row items-center justify-center"
        >
          <HyperLink link={{ url: gitHubRepoURL }}>
            <FaGithub size={32} />
          </HyperLink>
        </div>
      </Row>
    </footer>
  );
};

export default Footer;
