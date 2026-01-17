import React from 'react'

interface PhoneMockupProps {
    src: string
    alt: string
    className?: string
    priority?: boolean
    borderColor?: 'gray' | 'dark'
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({
    src,
    alt,
    className = '',
    priority = false,
    borderColor = 'dark'
}) => {
    return (
        <div className={`relative ${className}`}>
            {/* Main Container - Determines size */}
            <div className="relative rounded-[3rem] md:rounded-[3.5rem] bg-[#121212] overflow-hidden select-none">

                {/* 1. Outer Chassis Shadow/Depth */}
                <div className="absolute inset-0 rounded-[3rem] md:rounded-[3.5rem] shadow-[0_0_0_2px_#333,0_0_0_6px_#111,0_20px_50px_-10px_rgba(0,0,0,0.5)]" />

                {/* 2. Metallic Bezel Gradient (The 'Frame') */}
                <div className={`absolute -inset-[2px] rounded-[3.1rem] md:rounded-[3.6rem] bg-gradient-to-tr ${borderColor === 'gray'
                    ? 'from-gray-500 via-gray-300 to-gray-500' // Titanium/Pro look
                    : 'from-gray-800 via-gray-700 to-gray-900' // Dark/Graphite look
                    } z-0 pointer-events-none`}
                    style={{ opacity: 0.8 }}
                />

                {/* 3. Inner Black Bezel */}
                <div className="absolute inset-[4px] md:inset-[6px] bg-black rounded-[2.8rem] md:rounded-[3.2rem] z-10 pointer-events-none" />

                {/* 4. Screen Container */}
                <div className="relative z-20 m-[10px] md:m-[14px] rounded-[2.4rem] md:rounded-[2.8rem] overflow-hidden bg-black aspect-[9/19.5]">
                    {/* Image Content */}
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover"
                        loading={priority ? "eager" : "lazy"}
                    />

                    {/* 5. Screen Reflections (Glass Effect) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none z-20" />
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none z-20" />
                </div>

                {/* 6. Side Buttons (Decorative) */}
                {/* Volume Up/Down */}
                <div className="absolute top-24 -left-[3px] w-[3px] h-10 bg-gray-700 rounded-l-md z-0" />
                <div className="absolute top-36 -left-[3px] w-[3px] h-10 bg-gray-700 rounded-l-md z-0" />
                {/* Power Button */}
                <div className="absolute top-28 -right-[3px] w-[3px] h-16 bg-gray-700 rounded-r-md z-0" />

            </div>
        </div>
    )
}

export default PhoneMockup
