import React from 'react';
import Logo from './Logo';
import NavMenu from './NavMenu';

type HeaderProps = {
  className?: string,
};

const Header = (props: HeaderProps): React.ReactElement => {
  const { className = '' } = props;

  return (
    <header className={`flex flex-row items-center ${className}`}>
      <div className="mr-6">
        <Logo />
      </div>
      <nav>
        <NavMenu />
      </nav>
    </header>
  );
};

export default Header;
