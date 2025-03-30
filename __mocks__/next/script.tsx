import React from 'react';

const Script = ({ 
  children, 
  strategy = 'afterInteractive',
  dangerouslySetInnerHTML,
  src,
  id
}) => {
  return (
    <script
      data-nscript={strategy}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      src={src}
      id={id}
    >
      {children}
    </script>
  );
};

export default Script;

