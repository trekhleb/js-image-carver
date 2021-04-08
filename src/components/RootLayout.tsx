import React from 'react';

type RootLayoutProps = {
  children: React.ReactNode,
};

const RootLayout = (props: RootLayoutProps): React.ReactElement => {
  const { children } = props;
  return (
    <>
      {children}
    </>
  );
};

export default RootLayout;
