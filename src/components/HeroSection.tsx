/**
 * HeroSection component - Displays the main hero content with title and description
 */
export default function HeroSection() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white leading-tight">
        Split happens — we&apos;re here for it.
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
        Everything you need to manage your receipts is right here.
      </p>
    </div>
  );
}