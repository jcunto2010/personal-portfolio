import {
  CinematicHero,
  CINEMATIC_MOCK_VIDEO_SCALE,
  CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_BOOST,
  CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_EXTRA_Y,
  CINEMATIC_MOCK_VIDEO_SCALE_Y_RATIO,
} from '../../../components/ui/cinematic-landing-hero'
import { CinematicHeroMobile } from '../../../components/ui/cinematic-landing-hero-mobile'
import { useEffect, useMemo, useState } from 'react'
import { getProjectBySlug } from '../../data/projects.v2'
import { useLocale } from '../../lib/localeContext'

export function StartupConnectSection() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const project = getProjectBySlug('startupconnect')
  const reservoProject = getProjectBySlug('reservo-ai')
  const [isCompactViewport, setIsCompactViewport] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    const updateViewport = () => {
      setIsCompactViewport(window.innerWidth < 1024)
      setIsMobileViewport(window.innerWidth < 1024)
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const featureItems = useMemo(
    () =>
      isEs
        ? [
            'Feed social con publicaciones, comentarios, likes, compartidos y filtros.',
            'Matching por swipe con score de compatibilidad entre perfiles complementarios.',
            'Mensajería 1:1 y grupal en tiempo real con WebSocket y salas de comunidad.',
            'Backend Spring Boot + PostgreSQL con APIs y lógica de negocio escalable.',
          ]
        : [
            'Social feed with posts, comments, likes, shares, and filters.',
            'Swipe matching with compatibility scoring across complementary profiles.',
            'Real-time 1:1 and group messaging using WebSocket and community rooms.',
            'Spring Boot + PostgreSQL backend with scalable APIs and business logic.',
          ],
    [isEs],
  )

  const compactFeatureItems = isCompactViewport ? featureItems.slice(0, 3) : featureItems
  if (!project) return null
  const HeroComponent = isMobileViewport ? CinematicHeroMobile : CinematicHero

  return (
    <section
      id="chapter-startupconnect"
      aria-label={project.title}
      className="relative w-full overflow-x-hidden overflow-y-visible"
    >
      <HeroComponent
        tagline1={isEs ? 'Ahora vamos con' : "Now let's go with"}
        tagline2={isEs ? 'Startup Connect' : 'Startup Connect'}
        appLabel="StartupConnect"
        sourcePanelTitle={isEs ? 'Código real de StartupConnect' : 'Real StartupConnect source'}
        sourcePanelEyebrow={isEs ? 'Fragmentos de código' : 'Source snippets'}
        cardHeading={
          isEs ? 'Networking para startups.' : 'Startup networking platform.'
        }
        cardDescription={
          isEs
            ? (
              <>
                <span className="font-semibold text-white">StartupConnect</span> une feed,
                matching por swipe y chat en tiempo real.
              </>
              )
            : (
              <>
                <span className="font-semibold text-white">StartupConnect</span> combines feed,
                swipe matching, and real-time chat.
              </>
              )
        }
        caseLabel=""
        featureItems={compactFeatureItems}
        stackBelowSnippet
        equalThirdsColumns
        minimalSnippetChrome
        mockupScaleClassName="scale-[0.56] sm:scale-[0.66] md:scale-[0.76] lg:scale-[0.9] min-[1440px]:scale-[1.05]"
        stackItems={project.technologies}
        codeSnippetTitle={isEs ? 'Algoritmo de matching' : 'Matching algorithm'}
        codeSnippet={isEs ? project.codeSnippetEs : project.codeSnippetEn}
        codeSnippets={
          (
            isEs
              ? [
                {
                  title: 'SwipeCard.tsx',
                  code: `const handleSwipeRight = () => {
  setIsVisible(false);
  setTimeout(() => onSwipeRight(id), 300);
};

return (
  <Card className="w-full max-w-sm mx-auto h-[600px]">
    <Badge variant={
      type === 'investor' ? 'default' :
      type === 'entrepreneur' ? 'secondary' : 'outline'
    }>
      {type}
    </Badge>
  </Card>
);`,
                },
                {
                  title: 'api.ts',
                  code: `export async function getMatchingSuggestions(
  userId: string,
  limit = 10,
) {
  if (isUsingMockApi) {
    return MockApiService.getMatchingSuggestions(userId, limit);
  }

  return makeApiCall(
    \`/api/users/\${userId}/match-suggestions?limit=\${limit}\`,
  );
}

export async function createMatch(
  userId: string,
  matchedUserId: string,
  type: string,
) {
  return makeApiCall('/api/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, matchedUserId, type }),
  });
}`,
                },
              ]
              : [
                {
                  title: 'SwipeCard.tsx',
                  code: `const handleSwipeRight = () => {
  setIsVisible(false);
  setTimeout(() => onSwipeRight(id), 300);
};

return (
  <Card className="w-full max-w-sm mx-auto h-[600px]">
    <Badge variant={
      type === 'investor' ? 'default' :
      type === 'entrepreneur' ? 'secondary' : 'outline'
    }>
      {type}
    </Badge>
  </Card>
);`,
                },
                {
                  title: 'api.ts',
                  code: `export async function getMatchingSuggestions(
  userId: string,
  limit = 10,
) {
  if (isUsingMockApi) {
    return MockApiService.getMatchingSuggestions(userId, limit);
  }

  return makeApiCall(
    \`/api/users/\${userId}/match-suggestions?limit=\${limit}\`,
  );
}

export async function createMatch(
  userId: string,
  matchedUserId: string,
  type: string,
) {
  return makeApiCall('/api/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, matchedUserId, type }),
  });
}`,
                },
              ]
          ).slice(0, isCompactViewport ? 3 : 4)
        }
        videoSrc="https://assets.jonathancuntodiaz.com/startup_demo.mp4"
        videoTranslateXPx={1}
        videoScale={CINEMATIC_MOCK_VIDEO_SCALE + CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_BOOST}
        videoScaleYRatio={
          (CINEMATIC_MOCK_VIDEO_SCALE *
            CINEMATIC_MOCK_VIDEO_SCALE_Y_RATIO *
            CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_EXTRA_Y) /
          (CINEMATIC_MOCK_VIDEO_SCALE + CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_BOOST)
        }
        videoLabel={isEs ? 'Video demo' : 'Demo video'}
        videoFlowLabel={isEs ? 'Flujo MVP' : 'MVP Flow'}
        metricValue={project.technologies.length}
        metricLabel={isEs ? 'Módulos clave' : 'Core modules'}
        stackLabel={isEs ? 'Stack' : 'Stack'}
        ctaHeading={
          isEs
            ? '¿Quieres explorar mis proyectos?'
            : 'Want to explore my projects?'
        }
        ctaDescription={
          isEs
            ? isCompactViewport
              ? 'Reservo.AI y Startup Connect muestran mi arquitectura real end-to-end.'
              : 'Ambos proyectos muestran mi arquitectura real end-to-end: Reservo.AI con Flutter + IA conversacional y Startup Connect con React, Spring Boot, matching y chat en tiempo real.'
            : isCompactViewport
              ? 'Reservo.AI and Startup Connect showcase my real end-to-end architecture.'
              : 'Both projects show my real end-to-end architecture: Reservo.AI with Flutter + conversational AI, and Startup Connect with React, Spring Boot, matching, and realtime chat.'
        }
        finalActions={[
          {
            label: isEs ? 'Reservo.AI' : 'Reservo.AI',
            sublabel: isEs ? 'Ver código' : 'View source',
            href: reservoProject?.githubUrl ?? '/projects/reservo-ai',
            variant: 'dark',
          },
          {
            label: isEs ? 'Startup Connect' : 'Startup Connect',
            sublabel: isEs ? 'Ver código' : 'View source',
            href: project.githubUrl ?? '/projects/startupconnect',
            variant: 'dark',
          },
        ]}
        secondaryAction={{
          label: 'GitHub',
          sublabel: isEs ? 'Ver código' : 'View source',
          href: project.githubUrl ?? '/projects/startupconnect',
          variant: 'dark',
        }}
      />
    </section>
  )
}
