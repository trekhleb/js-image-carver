import React from 'react';
import ImageResizer from './ImageResizer';
import RootLayout from './RootLayout';
import PageLayout from './PageLayout';
import InteractivePostArea from './InteractivePostArea';
import { gitHubRepoURL, seamCarvingBlogPostURL, seamCarvingPaperURL } from '../constants/links';
import HyperLink from './HyperLink';
import { AiFillGithub } from '@react-icons/all-files/ai/AiFillGithub';
import { brandName } from '../constants/siteMeta';
import { FaPencilAlt } from '@react-icons/all-files/fa/FaPencilAlt';
import { RiFileList2Line } from '@react-icons/all-files/ri/RiFileList2Line';

function App() {
  const algorithmBlogPostLink = (
    <HyperLink
      className="inline-flex ml-1"
      link={{ url: seamCarvingBlogPostURL }}
      startEnhancer={<FaPencilAlt size={13} />}
    >
      How it works
    </HyperLink>
  );

  const gitHubLink = (
    <HyperLink
      className="inline-flex ml-1"
      link={{ url: gitHubRepoURL }}
      startEnhancer={(<AiFillGithub size={16} />)}
    >
      Source-code
    </HyperLink>
  );

  const algorithmPaperLink = (
    <HyperLink
      className="inline-flex ml-1"
      link={{ url: seamCarvingPaperURL }}
      startEnhancer={(<RiFileList2Line size={14} />)}
    >
      Seam carving paper
    </HyperLink>
  );

  return (
    <RootLayout>
      <PageLayout>
        <div className="flex flex-col items-center">
          <article className="w-full prose prose-sm sm:prose overflow-hidden" style={{ maxWidth: '860px' }}>
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              <h1 className="uppercase" style={{ margin: '0 20px 0 0' }}>{brandName}</h1>
              <h4 className="uppercase" style={{ margin: 0 }}>Content-aware image resizer</h4>
            </div>
            <div className="text-xs text-gray-500 mb-4 font-light flex items-center flex-row flex-wrap">
              <div className="flex flex-row justify-center mb-3 mr-4 md:mr-6">
                {algorithmBlogPostLink}
              </div>
              <div className="flex flex-row justify-center mb-3 mr-4 md:mr-6">
                {gitHubLink}
              </div>
              <div className="flex flex-row justify-center mb-3">
                {algorithmPaperLink}
              </div>
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
