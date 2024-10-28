// components/LazyIframe.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';

interface LazyIframeProps {
  srcDoc: string;
  title: string;
  className?: string;
}

const LazyIframe: React.FC<LazyIframeProps> = ({ srcDoc, title, className }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (iframeRef.current) {
      observer.observe(iframeRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={isVisible ? srcDoc : ''}
      title={title}
      className={className}
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default LazyIframe;
