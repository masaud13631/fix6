import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { toJalali, fromJalali } from '../utils/dateUtils';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  label?: string;
}

const DateInput: React.FC<DateInputProps> = ({ 
  value, 
  onChange, 
  required = false, 
  className = '',
  label 
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setDisplayValue(toJalali(date));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Convert Persian date to Gregorian for storage
    if (inputValue) {
      try {
        const gregorianDate = fromJalali(inputValue);
        onChange(gregorianDate.toISOString().split('T')[0]);
      } catch {
        // If conversion fails, keep the original value
        onChange(inputValue);
      }
    } else {
      onChange('');
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gregorianValue = e.target.value;
    onChange(gregorianValue);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="۱۴۰۳/۰۱/۰۱"
          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          required={required}
          dir="ltr"
          style={{ textAlign: 'right' }}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
        
        {/* Hidden Gregorian date picker for fallback */}
        <input
          type="date"
          value={value}
          onChange={handleDatePickerChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          tabIndex={-1}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        تاریخ را به صورت شمسی وارد کنید (مثال: ۱۴۰۳/۰۱/۰۱)
      </div>
    </div>
  );
};

export default DateInput;