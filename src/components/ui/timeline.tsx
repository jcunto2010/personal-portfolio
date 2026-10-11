'use client'

import { m, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface TimelineEntry {
  title: string
  content: ReactNode
}

interface TimelineProps {
  data: TimelineEntry[]
  heading?: string
  intro?: string
}

export function Timeline({
  data,
  heading = 'Changelog from my journey',
  intro = "I've been working on Aceternity for the past 2 years. Here's a timeline of my journey.",
}: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setHeight(rect.height)
  }, [data.length])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 50%'],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div
      className="bg-transparent md:px-10"
      style={{ fontFamily: "var(--v2-font-body, 'Proxima Nova', 'Inter', 'Arial', sans-serif)" }}
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-2xl md:text-4xl min-[1440px]:text-6xl mb-4 text-white max-w-4xl">{heading}</h2>
        <p className="text-neutral-300 text-sm md:text-base min-[1440px]:text-xl max-w-2xl">{intro}</p>
      </div>

      <div className="relative mx-auto w-[min(92vw,1320px)] overflow-hidden rounded-[32px] border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0.035)_100%)] shadow-[0_40px_120px_-28px_rgba(0,0,0,0.78),0_18px_50px_-24px_rgba(6,182,212,0.28),inset_0_1px_1px_rgba(255,255,255,0.24),inset_0_-1px_2px_rgba(0,0,0,0.24)] backdrop-blur-[30px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(124,58,237,0.24),transparent_34%),radial-gradient(circle_at_72%_32%,rgba(6,182,212,0.18),transparent_36%),linear-gradient(90deg,rgba(3,6,18,0.64)_0%,rgba(3,6,18,0.24)_34%,transparent_58%)]"
        />

        <div className="relative z-10">
          <div ref={ref} className="relative max-w-7xl mx-auto pb-20 pt-8 md:pt-12">
            {data.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex justify-start pt-10 md:pt-40 md:gap-10"
              >
                <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                  <div className="absolute left-3 md:left-3 size-10 rounded-full bg-white/95 dark:bg-black/95 flex items-center justify-center">
                    <div className="size-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
                  </div>
                  <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl min-[1440px]:text-6xl font-semibold text-neutral-200">
                    {item.title}
                  </h3>
                </div>

                <div className="relative pl-20 pr-4 md:pl-4 w-full">
                  <h3 className="md:hidden block text-2xl mb-4 text-left font-semibold text-neutral-200">
                    {item.title}
                  </h3>
                  {item.content}
                </div>
              </div>
            ))}

            <div
              style={{ height: `${height}px` }}
              className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
            >
              <m.div
                style={{ height: heightTransform, opacity: opacityTransform }}
                className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
