'use client'

import { cn } from '../../lib/utils'
import {
  CINEMATIC_MOCK_VIDEO_SCALE,
  CINEMATIC_MOCK_VIDEO_SCALE_X_RATIO,
  CINEMATIC_MOCK_VIDEO_SCALE_Y_RATIO,
  CINEMATIC_MOCK_VIDEO_TRANSLATE_X_DEFAULT_PX,
} from './cinematic-landing-hero'

const PHONE_MOCK_STYLES = `
  .transform-style-3d-phone { transform-style: preserve-3d; }
  .iphone-bezel-phone {
      background-color: #111;
      box-shadow:
          inset 0 0 0 2px #52525B,
          inset 0 0 0 7px #000,
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }
  .hardware-btn-phone {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow:
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }
`

export interface PhoneMockVideoProps {
  videoSrc: string
  videoTranslateXPx?: number
  videoScale?: number
  videoScaleXRatio?: number
  videoScaleYRatio?: number
  /** Applied to the outer flex wrapper (e.g. scale down in narrow side panels). */
  className?: string
  /** Visually hidden label for the decorative demo clip. */
  ariaLabel?: string
}

export function PhoneMockVideo({
  videoSrc,
  videoTranslateXPx = CINEMATIC_MOCK_VIDEO_TRANSLATE_X_DEFAULT_PX,
  videoScale = CINEMATIC_MOCK_VIDEO_SCALE,
  videoScaleXRatio = CINEMATIC_MOCK_VIDEO_SCALE_X_RATIO,
  videoScaleYRatio = CINEMATIC_MOCK_VIDEO_SCALE_Y_RATIO,
  className,
  ariaLabel = 'Product demo video',
}: PhoneMockVideoProps) {
  const videoScaleY = videoScale * videoScaleYRatio
  const videoScaleX = videoScale * videoScaleXRatio

  return (
    <div className={cn('flex w-full items-center justify-center', className)}>
      <style>{PHONE_MOCK_STYLES}</style>
      <div
        className="transform-style-3d-phone relative flex max-w-full flex-col"
        aria-label={ariaLabel}
      >
        <span className="sr-only">{ariaLabel}</span>
        <div
          className="iphone-bezel-phone transform-style-3d-phone relative flex h-[520px] w-[252px] max-w-[min(100%,252px)] flex-col rounded-[2.5rem] sm:h-[560px] sm:w-[272px] sm:rounded-[2.8rem] lg:h-[500px] lg:w-[244px] lg:rounded-[2.75rem] min-[1440px]:h-[548px] min-[1440px]:w-[268px] min-[1440px]:rounded-[3rem]"
        >
          <div className="hardware-btn-phone absolute -left-[3px] top-[120px] z-0 h-[25px] w-[3px] rounded-l-md" aria-hidden="true" />
          <div className="hardware-btn-phone absolute -left-[3px] top-[160px] z-0 h-[45px] w-[3px] rounded-l-md" aria-hidden="true" />
          <div className="hardware-btn-phone absolute -left-[3px] top-[220px] z-0 h-[45px] w-[3px] rounded-l-md" aria-hidden="true" />
          <div
            className="hardware-btn-phone absolute -right-[3px] top-[170px] z-0 h-[70px] w-[3px] scale-x-[-1] rounded-r-md"
            aria-hidden="true"
          />

          <div className="absolute inset-[7px] z-10 overflow-hidden rounded-[2.5rem] bg-[#050914] text-white shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
            <div className="absolute inset-0 z-20 overflow-hidden rounded-[2.5rem] bg-[#050914]">
              <video
                className="pointer-events-none block h-full w-full min-h-full min-w-full max-h-none max-w-none object-cover object-center"
                style={{
                  transform: `translate3d(${videoTranslateXPx}px, 0, 0) scaleX(${videoScaleX}) scaleY(${videoScaleY})`,
                  transformOrigin: 'center center',
                }}
                src={videoSrc}
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
