import React from 'react';
import GrainOverlay from './GrainOverlay';

const GrainContainer = ({
  children,
  grainProps = {},
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div
      className={`grain-container relative overflow-hidden ${className}`}
      style={style}
      {...props}
    >
      {children}
      <GrainOverlay {...grainProps} />
    </div>
  );
};

export default GrainContainer;