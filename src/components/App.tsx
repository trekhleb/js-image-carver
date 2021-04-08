import React from 'react';
import ImageResizer from './ImageResizer';
import RootLayout from './RootLayout';
import PageLayout from './PageLayout';
import InteractivePostArea from './InteractivePostArea';

function App() {
  return (
    <RootLayout>
      <PageLayout>
        <div className="flex flex-col items-center">
          <article className="w-full prose prose-sm sm:prose overflow-hidden prose-red" style={{ maxWidth: '860px' }}>
            <div className="flex flex-col sm:flex-row sm:items-center mb-6">
              <h1 className="uppercase" style={{ margin: '0 20px 0 0' }}>JS Seam Carver</h1>
              <h3 className="uppercase" style={{ margin: 0 }}>Content-aware image resizer</h3>
            </div>
            <InteractivePostArea>
              <ImageResizer withSeam />
            </InteractivePostArea>
          </article>
        </div>
      </PageLayout>
    </RootLayout>
  );
}

export default App;
