import { CinematicHero } from '../../../components/ui/cinematic-landing-hero'
import { getProjectBySlug } from '../../data/projects.v2'
import { useLocale } from '../../lib/localeContext'

export function StartupConnectSection() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const project = getProjectBySlug('startupconnect')
  const reservoProject = getProjectBySlug('reservo-ai')

  if (!project) return null

  return (
    <section
      id="chapter-startupconnect"
      aria-label={project.title}
      style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        overflow: 'hidden',
      }}
    >
      <CinematicHero
        tagline1={isEs ? 'Ahora vamos con' : "Now let's go with"}
        tagline2={isEs ? 'Startup Connect' : 'Startup Connect'}
        appLabel="StartupConnect"
        sourcePanelTitle={isEs ? 'Codigo real de StartupConnect' : 'Real StartupConnect source'}
        cardHeading={
          isEs
            ? 'Networking profesional full-stack, construido desde cero.'
            : 'Full-stack professional networking, built from scratch.'
        }
        cardDescription={
          isEs ? (
            <>
              <span className="font-semibold text-white">StartupConnect</span> combina un feed
              social tipo LinkedIn, descubrimiento por swipe, matching por compatibilidad y chat en
              tiempo real para founders, investors y mentors.
            </>
          ) : (
            <>
              <span className="font-semibold text-white">StartupConnect</span> combines a
              LinkedIn-style social feed, swipe discovery, compatibility matching, and real-time
              chat for founders, investors, and mentors.
            </>
          )
        }
        caseLabel={isEs ? 'Arquitectura de producto real' : 'Real product architecture'}
        featureItems={
          isEs
            ? [
                'Feed social con publicaciones, comentarios, likes, compartidos y filtros.',
                'Matching por swipe con score de compatibilidad entre perfiles complementarios.',
                'Mensajeria 1:1 y grupal en tiempo real con WebSocket y salas de comunidad.',
                'Backend Spring Boot + PostgreSQL con APIs y logica de negocio escalable.',
              ]
            : [
                'Social feed with posts, comments, likes, shares, and filters.',
                'Swipe matching with compatibility scoring across complementary profiles.',
                'Real-time 1:1 and group messaging using WebSocket and community rooms.',
                'Spring Boot + PostgreSQL backend with scalable APIs and business logic.',
              ]
        }
        stackItems={project.technologies}
        codeSnippetTitle={isEs ? 'Algoritmo de matching' : 'Matching algorithm'}
        codeSnippet={isEs ? project.codeSnippetEs : project.codeSnippetEn}
        codeSnippets={
          isEs
            ? [
                {
                  title: 'MatchService.java',
                  code: `private double calculateMatchScore(
    User currentUser,
    User targetUser,
    UserPreferences preferences) {
  double score = 0;

  Set<Set<UserType>> compatiblePairs = Set.of(
    Set.of(UserType.ENTREPRENEUR, UserType.INVESTOR),
    Set.of(UserType.ENTREPRENEUR, UserType.MENTOR),
    Set.of(UserType.INVESTOR, UserType.MENTOR)
  );

  if (compatiblePairs.contains(Set.of(
      currentUser.getUserType(),
      targetUser.getUserType()))) {
    score += 20;
  } else {
    score += 10;
  }

  if (preferences == null) return score;
  if (preferences.getSeekingUserTypes()
      .contains(targetUser.getUserType().getValue())) {
    score += 15;
  }

  return score;
}`,
                },
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
                {
                  title: 'RoomService.java',
                  code: `public Map<String, Object> sendMessage(
    String roomId,
    String userId,
    String content) {
  Optional<Room> roomOpt = roomRepository.findById(roomId);
  if (roomOpt.isEmpty()) {
    throw new IllegalArgumentException("Room not found");
  }

  Set<String> members = roomMembers.getOrDefault(roomId, new HashSet<>());
  if (!members.contains(userId)) {
    throw new SecurityException("User is not a member of this room");
  }

  Map<String, Object> message = new HashMap<>();
  message.put("id", UUID.randomUUID().toString());
  message.put("content", content);
  message.put("userId", userId);
  message.put("createdAt", LocalDateTime.now());

  roomMessages.computeIfAbsent(roomId, k -> new ArrayList<>()).add(message);
  return message;
}`,
                },
              ]
            : [
                {
                  title: 'MatchService.java',
                  code: `private double calculateMatchScore(
    User currentUser,
    User targetUser,
    UserPreferences preferences) {
  double score = 0;

  Set<Set<UserType>> compatiblePairs = Set.of(
    Set.of(UserType.ENTREPRENEUR, UserType.INVESTOR),
    Set.of(UserType.ENTREPRENEUR, UserType.MENTOR),
    Set.of(UserType.INVESTOR, UserType.MENTOR)
  );

  if (compatiblePairs.contains(Set.of(
      currentUser.getUserType(),
      targetUser.getUserType()))) {
    score += 20;
  } else {
    score += 10;
  }

  if (preferences == null) return score;
  if (preferences.getSeekingUserTypes()
      .contains(targetUser.getUserType().getValue())) {
    score += 15;
  }

  return score;
}`,
                },
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
                {
                  title: 'RoomService.java',
                  code: `public Map<String, Object> sendMessage(
    String roomId,
    String userId,
    String content) {
  Optional<Room> roomOpt = roomRepository.findById(roomId);
  if (roomOpt.isEmpty()) {
    throw new IllegalArgumentException("Room not found");
  }

  Set<String> members = roomMembers.getOrDefault(roomId, new HashSet<>());
  if (!members.contains(userId)) {
    throw new SecurityException("User is not a member of this room");
  }

  Map<String, Object> message = new HashMap<>();
  message.put("id", UUID.randomUUID().toString());
  message.put("content", content);
  message.put("userId", userId);
  message.put("createdAt", LocalDateTime.now());

  roomMessages.computeIfAbsent(roomId, k -> new ArrayList<>()).add(message);
  return message;
}`,
                },
              ]
        }
        videoLabel={isEs ? 'Video demo' : 'Demo video'}
        videoStatus={isEs ? 'Video en preparacion' : 'Video in progress'}
        videoPlaceholderTitle={isEs ? 'Demo pendiente' : 'Demo coming soon'}
        videoPlaceholderDescription={
          isEs
            ? 'Aqui ira el video real del flujo: onboarding, swipe matching, chat en tiempo real y comunidad.'
            : 'This space will hold the real product walkthrough: onboarding, swipe matching, realtime chat, and community flow.'
        }
        metricValue={project.technologies.length}
        metricLabel={isEs ? 'Modulos clave' : 'Core modules'}
        ctaHeading={
          isEs
            ? '¿Quieres explorar mis proyectos?'
            : 'Want to explore my projects?'
        }
        ctaDescription={
          isEs
            ? 'Ambos proyectos muestran mi arquitectura real end-to-end: Reservo.AI con Flutter + IA conversacional y Startup Connect con React, Spring Boot, matching y chat en tiempo real.'
            : 'Both projects show my real end-to-end architecture: Reservo.AI with Flutter + conversational AI, and Startup Connect with React, Spring Boot, matching, and realtime chat.'
        }
        finalActions={[
          {
            label: isEs ? 'Reservo.AI' : 'Reservo.AI',
            sublabel: isEs ? 'Ver codigo' : 'View source',
            href: reservoProject?.githubUrl ?? '/projects/reservo-ai',
            variant: 'dark',
          },
          {
            label: isEs ? 'Startup Connect' : 'Startup Connect',
            sublabel: isEs ? 'Ver codigo' : 'View source',
            href: project.githubUrl ?? '/projects/startupconnect',
            variant: 'dark',
          },
        ]}
        secondaryAction={{
          label: 'GitHub',
          sublabel: isEs ? 'Ver codigo' : 'View source',
          href: project.githubUrl ?? '/projects/startupconnect',
          variant: 'dark',
        }}
      />
    </section>
  )
}
