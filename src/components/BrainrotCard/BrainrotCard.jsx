export default function BrainrotCard({ name, imageUrl, href, isActive = false }) {
  return (
    <div className="flex flex-col w-full gap-0 transition-all duration-300">
      {/* Card Container - Image + Info combined */}
      <div 
        className={`bg-white dark:bg-[#0F172A] rounded-[20px] border overflow-hidden transition-colors duration-300 ${
          isActive 
            ? 'border-[#4F46E5] shadow-lg dark:shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
            : 'border-[#E5E7EB] dark:border-white/10'
        }`}
      >
        {/* Image Container */}
        <div className="relative w-full aspect-square flex items-center justify-center p-4 bg-[#F9FAFB] dark:bg-[#020617]/50 transition-colors duration-300">
          <img
            src={imageUrl}
            alt={name}
            className="object-contain max-w-full max-h-full"
          />
        </div>
        
        {/* Info Container */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0F172A] border-t border-[#E5E7EB] dark:border-white/10 transition-colors duration-300">
          <span className="text-base font-medium text-[#020617] dark:text-white font-urbanist transition-colors duration-300">
            {name}
          </span>
          <a
            href={href}
            className="bg-[#4F46E5] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#6366F1] transition-colors w-8 h-8"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 15L15 5M15 5H8M15 5V12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

