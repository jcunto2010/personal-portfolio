import React, { useRef } from 'react'

interface Step {
    id: string
    label: string
    description?: string
    isPrimary?: boolean
}

interface FlowStepperProps {
    steps: Step[]
    accentColor?: string
}

const FlowStepper: React.FC<FlowStepperProps> = ({ steps, accentColor = 'violet' }) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    const colorClasses = {
        violet: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    }[accentColor as 'violet' | 'blue' | 'indigo'] || 'text-violet-400 bg-violet-500/10 border-violet-500/30'

    const dotClasses = {
        violet: 'bg-violet-500 shadow-violet-500/50',
        blue: 'bg-blue-500 shadow-blue-500/50',
        indigo: 'bg-indigo-500 shadow-indigo-500/50',
    }[accentColor as 'violet' | 'blue' | 'indigo'] || 'bg-violet-500 shadow-violet-500/50'

    return (
        <div className="w-full relative py-6">
            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className="flex-shrink-0 w-[280px] md:w-[320px] snap-center group"
                    >
                        <div className={`h-full p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${step.isPrimary
                                ? `${colorClasses} backdrop-blur-md`
                                : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                            }`}>
                            {/* Step Number & Connector */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.isPrimary ? dotClasses + ' text-white' : 'bg-white/10 text-white/60'
                                    }`}>
                                    {index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                                )}
                            </div>

                            {/* Step Label */}
                            <h4 className={`text-lg font-semibold mb-2 ${step.isPrimary ? 'text-white' : 'text-white/80'}`}>
                                {step.label}
                            </h4>

                            {/* Step Description */}
                            {step.description && (
                                <p className="text-gray-400 text-sm leading-relaxed font-body">
                                    {step.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Swipe Hint Label (Mobile) */}
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 text-xs uppercase tracking-widest sm:hidden">
                <span>Swipe to explore flow</span>
                <div className="w-8 h-px bg-gray-500/30 animate-pulse" />
            </div>
        </div>
    )
}

export default FlowStepper
