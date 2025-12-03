function CustomSelect({
  options,
  iconSrc,
  onChange,
  value,
}: {
  options: string[];
  iconSrc: string;
  onChange?: (value: string) => void;
  value?: string;
}) {
  return (
    <div className="relative flex items-center border border-gray-300 rounded-xl px-3 py-2 shadow-sm text-gray-400 ">
      <img src={iconSrc} alt="Filter" className="h-4 w-4 mr-2 opacity-60" />
      <select
        className="text-sm bg-transparent outline-none appearance-none pr-6 cursor-pointer"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 flex flex-col items-center justify-center text-gray-500 -space-y-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 10 10"
        >
          <path d="M5 2 L2 5 H8 Z" fill="gray" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 10 10"
        >
          <path d="M5 8 L2 5 H8 Z" fill="gray" />
        </svg>
      </div>
    </div>
  );
}
export default CustomSelect;
