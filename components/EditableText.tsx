import React, { useState, useEffect } from 'react';
import { Check, X, Pencil, AlertCircle } from 'lucide-react';
import { validateUpdate } from '../utils/validation';

interface Props {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  isAdmin: boolean;
  multiline?: boolean;
  className?: string;
  label?: string;
  useTypewriter?: boolean;
  contentKey?: string;
}

const Typewriter: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    setDisplayed('');
    setShowCursor(true);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        // Keep cursor for a moment after typing finishes, then hide
        setTimeout(() => setShowCursor(false), 800);
      }
    }, 40); // 40ms per character
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className={className}>
      {displayed}
      <span className={`animate-pulse font-light text-blue-500 transition-opacity duration-500 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
    </span>
  );
};

const EditableText: React.FC<Props> = ({ value, onSave, isAdmin, multiline = false, className = '', label, useTypewriter = false, contentKey = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = async () => {
    const check = validateUpdate(contentKey, tempValue);
    if (!check.valid) {
        setValidationError(check.error || "Invalid input");
        return;
    }

    setSaving(true);
    try {
        await onSave(tempValue);
        setIsEditing(false);
        setValidationError('');
    } catch (e: any) {
        setValidationError(e.message);
    } finally {
        setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setValidationError('');
  };

  if (!isAdmin && !isEditing) {
    if (useTypewriter) {
      return <Typewriter text={value} className={className} />;
    }
    return <span className={className}>{value}</span>;
  }

  if (isAdmin && !isEditing) {
    return (
      <div className="group relative inline-block">
        <span className={className}>{value}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-3 -right-3 bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title={`Edit ${label || 'text'}`}
        >
          <Pencil size={12} className="text-blue-600 dark:text-blue-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative animate-fade-in bg-white dark:bg-gray-900 p-2 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm ring-4 ring-blue-50/50 dark:ring-blue-900/20 z-20 min-w-[200px]">
      {label && <div className="text-xs text-blue-500 dark:text-blue-400 font-semibold mb-1 uppercase tracking-wider">{label}</div>}
      
      {multiline ? (
        <textarea
          value={tempValue}
          onChange={(e) => {
              setTempValue(e.target.value);
              setValidationError(''); 
          }}
          className="w-full min-h-[100px] p-2 text-gray-800 dark:text-gray-200 outline-none resize-y bg-transparent font-sans"
        />
      ) : (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => {
              setTempValue(e.target.value);
              setValidationError('');
          }}
          className="w-full p-1 text-gray-800 dark:text-gray-200 outline-none bg-transparent font-sans"
        />
      )}

      {validationError && (
          <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs mt-1 px-1">
              <AlertCircle size={12} /> {validationError}
          </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={handleCancel}
          className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors"
          disabled={saving}
        >
          <X size={18} />
        </button>
        <button
          onClick={handleSave}
          className="p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30 text-green-500 dark:text-green-400 transition-colors"
          disabled={saving}
        >
          <Check size={18} />
        </button>
      </div>
    </div>
  );
};

export default EditableText;