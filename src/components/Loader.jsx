import React from 'react';

const Loader = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80">
    <div className="relative">
      <div className="ease-linear rounded-full border-8 border-gray-200 border-t-indigo-600 h-24 w-24 animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      </div>
    </div>
    <div className="mt-4 text-xl font-semibold text-indigo-700">Loading...</div>
    <div className="mt-2 text-sm text-gray-600">Please wait while we prepare your content</div>
  </div>
);

export default Loader;