/**
 * 通用按钮组件
 */
function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = 'font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          加载中...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
