import React from 'react'

export interface ImpactMetric {
  id: string
  value: string
  label: string
  description?: string
}

export interface ImpactMetricsProps {
  metrics: ImpactMetric[]
  columns?: 2 | 3
  className?: string
}

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({
  metrics,
  columns = 3,
  className = '',
}) => {
  const gridCols = columns === 2
    ? 'md:grid-cols-2'
    : 'md:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 gap-4 ${gridCols} ${className}`}>
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="hover-lift rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-all"
        >
          <div className="font-heading text-3xl font-bold text-primary-300 md:text-4xl">
            {metric.value}
          </div>
          <div className="mt-1 font-body font-medium text-white/90">
            {metric.label}
          </div>
          {metric.description && (
            <p className="mt-2 text-sm text-gray-400 font-body">
              {metric.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
