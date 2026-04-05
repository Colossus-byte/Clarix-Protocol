import React from 'react';

interface ProFeatureWrapperProps {
  isPro: boolean;
  featureName: string;
  children: React.ReactNode;
  onUpgrade: () => void;
}

// During beta, all features are unlocked for everyone.
const ProFeatureWrapper: React.FC<ProFeatureWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProFeatureWrapper;
