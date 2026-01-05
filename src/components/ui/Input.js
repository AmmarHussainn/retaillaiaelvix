import React from 'react';

const Input = ({ label, type = 'text', className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Input;
