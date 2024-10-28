import React from 'react';

const NoAddressProvidedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">No Address Provided</h1>
      <p className="text-lg text-gray-600">
        Please provide a wallet address to continue.
      </p>
    </div>
  );
};

export default NoAddressProvidedPage;
