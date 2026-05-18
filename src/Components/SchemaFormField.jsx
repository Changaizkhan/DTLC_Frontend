import { getFieldDef, sanitizeValue } from '../lib/schema';

function fieldClass(hasError, extra = '') {
  const base = hasError
    ? 'field border-red-400 focus:border-red-500 focus:ring-red-200'
    : 'field';
  return extra ? `${base} ${extra}` : base;
}

function ErrorText({ message }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1 font-medium" role="alert">
      {message}
    </p>
  );
}

/**
 * @param {{
 *   fieldKey: string,
 *   value: unknown,
 *   onChange: (value: string) => void,
 *   error?: string,
 *   disabled?: boolean,
 *   className?: string,
 *   inputClassName?: string,
 *   placeholder?: string,
 *   hideLabel?: boolean,
 *   emptyOptionLabel?: string,
 * }} props
 */
export function SchemaFormField({
  fieldKey,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  inputClassName = '',
  placeholder,
  hideLabel = false,
  emptyOptionLabel = '-- Select One --',
}) {
  const def = getFieldDef(fieldKey);
  if (!def) return null;

  const display =
    value === null || value === undefined || value === '' ? '' : String(value);

  const handleChange = (raw) => {
    onChange(sanitizeValue(def.type, raw, def));
  };

  const cls = fieldClass(!!error, inputClassName);
  const ph = placeholder ?? `Enter ${def.label.toLowerCase()}`;

  let control;

  if (def.type === 'select') {
    control = (
      <select
        className={cls}
        value={display}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{emptyOptionLabel}</option>
        {def.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  } else if (def.multiline) {
    control = (
      <textarea
        rows={fieldKey === 'details.comments' ? 3 : 1}
        className={`${cls} resize-none`}
        placeholder={ph}
        value={display}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
      />
    );
  } else {
    const inputType =
      def.type === 'email'
        ? 'email'
        : def.type === 'phone'
          ? 'tel'
          : def.type === 'date'
            ? 'date'
            : def.type === 'time'
              ? 'time'
              : 'text';

    const inputMode =
      def.type === 'phone'
        ? 'tel'
        : def.type === 'email'
          ? 'email'
          : def.type === 'integer'
            ? 'numeric'
            : def.type === 'number'
              ? 'decimal'
              : def.type === 'text'
                ? 'text'
                : undefined;

    control = (
      <input
        type={inputType}
        inputMode={inputMode}
        className={cls}
        placeholder={ph}
        value={display}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        autoComplete={def.type === 'email' ? 'email' : undefined}
        onKeyDown={
          def.type === 'integer'
            ? (e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
              }
            : def.type === 'number'
              ? (e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                }
              : undefined
        }
      />
    );
  }

  return (
    <div className={className}>
      {!hideLabel ? (
        <label className="label">
          {def.label}
          {def.required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}
      {control}
      <ErrorText message={error} />
    </div>
  );
}

export { ErrorText, fieldClass };
