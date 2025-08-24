import { AuthButton } from "@/components/AuthButton";

export default function Page() {
  // Array of available login visuals
  const loginVisuals = [
    '/loginVisuals/login_visual_1.JPEG',
    '/loginVisuals/login_visual_2.JPEG'
  ];

  // Randomly select one image
  const randomImage = loginVisuals[Math.floor(Math.random() * loginVisuals.length)];

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      {/* Content Area - Always at top on mobile */}
      <div className="bg-white p-8 md:p-12 flex flex-col justify-start md:justify-center items-center md:items-start text-center md:text-left md:flex-none md:w-[45%]">
        {/* Envelope Icon */}
        <div className="mb-6 md:mb-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 6l10 8 10-8"/>
          </svg>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
          Split the bill,<br />
          not the vibes.
        </h1>

        {/* Sub-heading */}
        <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-md md:max-w-none">
          You tell us who got what—we&apos;ll do the rest.
        </p>

        {/* Auth Button */}
        <AuthButton />
      </div>

      {/* Image Area - Below content on mobile, right side on desktop */}
      <div className="flex-1 bg-gray-50 rounded-t-2xl md:rounded-l-none md:rounded-r-2xl flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0">
        <img
          src={randomImage}
          alt="Friends at a restaurant with the check arriving"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
