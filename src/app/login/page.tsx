import { AuthButton } from "@/components/AuthButton";

export default function Page() {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Left Content Area */}
      <div style={{ 
        flex: '0 0 45%',
        backgroundColor: 'white',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        {/* Envelope Icon */}
        <div style={{ marginBottom: '32px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 6l10 8 10-8"/>
          </svg>
        </div>

        {/* Main Heading */}
        <h1 style={{ 
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          margin: '0 0 16px 0',
          lineHeight: '1.1'
        }}>
          Split the bill,<br />
          not the vibes.
        </h1>

        {/* Sub-heading */}
        <p style={{ 
          fontSize: '18px',
          color: '#4a4a4a',
          margin: '0 0 32px 0',
          lineHeight: '1.5'
        }}>
          You tell us who got what—we&apos;ll do the rest.
        </p>

        {/* Auth Button */}
        <AuthButton />
      </div>

      {/* Right Image Area */}
      <div style={{ 
        flex: '1',
        backgroundColor: '#f5f5f5',
        borderRadius: '0 16px 16px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <img 
          src="/restaurant-scene.svg" 
          alt="Friends at a restaurant with the check arriving"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>
    </div>
  );
}


