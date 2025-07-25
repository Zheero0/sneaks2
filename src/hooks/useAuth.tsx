
'use client';

import * as React from 'react';
import AuthContext from '@/context/AuthContext';

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
