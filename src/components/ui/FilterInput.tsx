import React from 'react';

interface SelectFilterProps {
  defaultValue: string;
  options: string[];
  onChange?: (value: string) => void;
  className?: string;
}

export function SelectFilter({ defaultValue, options, onChange, className = '' }: SelectFilterProps) {
  return (
    <select 
      className={`bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 ${className}`}
      defaultValue={defaultValue}
      onChange={e => onChange && onChange(e.target.value)}
      style={{ backgroundColor: '#FFFFFF', color: '#4B5563' }}
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

interface DateFilterProps {
  onChange?: (date: string) => void;
  className?: string;
}

export function DateFilter({ onChange, className = '' }: DateFilterProps) {
  return (
    <input 
      type="date" 
      placeholder="mm/dd/yyyy"
      className={`bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 ${className}`} 
      onChange={e => onChange && onChange(e.target.value)}
      style={{ backgroundColor: '#FFFFFF', color: '#4B5563' }}
    />
  );
}

interface SearchFilterProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchFilter({ placeholder, value, onChange, className = '' }: SearchFilterProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 ${className}`}
      style={{ backgroundColor: '#FFFFFF', color: '#4B5563' }}
    />
  );
} 