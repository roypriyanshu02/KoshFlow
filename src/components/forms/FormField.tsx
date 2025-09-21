import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select';
  placeholder?: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  className?: string;
  helpText?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  options = [],
  rows = 3,
  min,
  max,
  step,
  pattern,
  autoComplete,
  className,
  helpText,
}: FormFieldProps) {
  const fieldId = `field-${name}`;
  const hasError = !!error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const handleSelectChange = (value: string) => {
    onChange(value);
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            rows={rows}
            className={cn(
              hasError && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            aria-describedby={hasError ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleSelectChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                hasError && 'border-destructive focus:ring-destructive',
                className
              )}
              aria-describedby={hasError ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            id={fieldId}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            autoComplete={autoComplete}
            className={cn(
              hasError && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            aria-describedby={hasError ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
            aria-invalid={hasError}
            aria-required={required}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={cn(hasError && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {renderField()}
      
      {helpText && !hasError && (
        <p id={`${fieldId}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {hasError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription id={`${fieldId}-error`}>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Specialized form fields for common use cases

export function EmailField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="email"
      autoComplete="email"
      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
    />
  );
}

export function PhoneField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="tel"
      autoComplete="tel"
      pattern="(\+91[-\s]?)?[6-9]\d{9}"
      placeholder="+91 98765 43210"
    />
  );
}

export function PasswordField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="password"
      autoComplete="new-password"
    />
  );
}

export function NumberField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="number"
      step="0.01"
    />
  );
}

export function CurrencyField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="number"
      step="0.01"
      min="0"
      placeholder="0.00"
    />
  );
}

export function PercentageField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="number"
      step="0.01"
      min="0"
      max="100"
      placeholder="0.00"
    />
  );
}

export function GSTINField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="text"
      pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
      placeholder="29ABCDE1234F1Z5"
      helpText="Enter 15-character GSTIN (e.g., 29ABCDE1234F1Z5)"
    />
  );
}

export function PANField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="text"
      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
      placeholder="ABCDE1234F"
      helpText="Enter 10-character PAN (e.g., ABCDE1234F)"
    />
  );
}

export function HSNCodeField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="text"
      pattern="[0-9]{4,8}"
      placeholder="1234"
      helpText="Enter 4-8 digit HSN code"
    />
  );
}

export function SKUField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="text"
      pattern="[A-Z0-9-_]+"
      placeholder="PROD-001"
      helpText="Use uppercase letters, numbers, hyphens, and underscores only"
    />
  );
}

export function AccountCodeField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="text"
      pattern="[A-Z0-9-_]+"
      placeholder="ACC-001"
      helpText="Use uppercase letters, numbers, hyphens, and underscores only"
    />
  );
}

export function DateField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="date"
      max={new Date().toISOString().split('T')[0]}
    />
  );
}

export function FutureDateField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="date"
      min={new Date().toISOString().split('T')[0]}
    />
  );
}

export function PinCodeField(props: Omit<FormFieldProps, 'type'>) {
  return (
    <FormField
      {...props}
      type="text"
      pattern="[1-9][0-9]{5}"
      placeholder="560001"
      helpText="Enter 6-digit PIN code"
    />
  );
}

export default FormField;
