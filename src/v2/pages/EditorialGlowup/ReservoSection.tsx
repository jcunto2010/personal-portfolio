import { CinematicHero } from '../../../components/ui/cinematic-landing-hero'
import { CinematicHeroMobile } from '../../../components/ui/cinematic-landing-hero-mobile'
import { useEffect, useMemo, useState } from 'react'
import { getProjectBySlug } from '../../data/projects.v2'
import { useLocale } from '../../lib/localeContext'

export function ReservoSection() {
  const { locale } = useLocale()
  const isEs = locale === 'es'
  const project = getProjectBySlug('reservo-ai')
  const [isCompactViewport, setIsCompactViewport] = useState(false)

  useEffect(() => {
    const updateViewport = () => {
      setIsCompactViewport(window.innerWidth < 1024)
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const featureItems = useMemo(
    () =>
      isEs
        ? [
            'Reserva conversacional: Gemini convierte lenguaje natural en datos estructurados.',
            'Firebase como capa backend: auth, Firestore, notificaciones y persistencia.',
            'Riverpod para estado, sesión biométrica y recuperación segura del usuario.',
            'Onboarding animado con Rive/Lottie para explicar el producto antes del primer uso.',
          ]
        : [
            'Conversational booking: Gemini turns natural language into structured data.',
            'Firebase backend layer: auth, Firestore, notifications, and persistence.',
            'Riverpod for state, biometric session restore, and secure user recovery.',
            'Rive/Lottie onboarding to explain the product before the first use.',
          ],
    [isEs],
  )

  const compactFeatureItems = isCompactViewport ? featureItems.slice(0, 3) : featureItems
  if (!project) return null
  const HeroComponent = isCompactViewport ? CinematicHeroMobile : CinematicHero

  return (
    <section
      id="chapter-reservo"
      aria-label={project.title}
      className="relative w-full overflow-x-hidden overflow-y-visible"
    >
      <HeroComponent
        tagline1={isEs ? 'Mis proyectos,' : 'My projects,'}
        tagline2={isEs ? 'empezando por Reservo.AI.' : 'starting with Reservo.AI.'}
        cardHeading={
          isEs ? 'Reservas con IA en Flutter.' : 'AI-powered booking in Flutter.'
        }
        cardDescription={
          isCompactViewport
            ? isEs
              ? (
                <>
                  <span className="font-semibold text-white">Reservo.AI</span> combina Flutter,
                  Gemini y Firebase en un MVP móvil de reservas con IA conversacional.
                </>
                )
              : (
                <>
                  <span className="font-semibold text-white">Reservo.AI</span> combines Flutter,
                  Gemini, and Firebase into a mobile MVP for conversational booking.
                </>
                )
            : isEs
              ? (
                <>
                  <span className="font-semibold text-white">Reservo.AI</span> une Flutter,
                  Gemini AI, Firebase, biometría, Riverpod, Rive y Lottie en un MVP móvil para
                  negocios de servicios.
                </>
                )
              : (
                <>
                  <span className="font-semibold text-white">Reservo.AI</span> connects Flutter,
                  Gemini AI, Firebase, biometrics, Riverpod, Rive, and Lottie into one mobile MVP
                  for service businesses.
                </>
                )
        }
        caseLabel=""
        featureItems={compactFeatureItems}
        stackBelowSnippet
        equalThirdsColumns
        minimalSnippetChrome
        stackItems={project.technologies}
        codeSnippetTitle={isEs ? 'Parser de reservas con Gemini' : 'Gemini booking parser'}
        codeSnippet={isEs ? project.codeSnippetEs : project.codeSnippetEn}
        codeSnippets={
          (
            isEs
              ?               [
                {
                  title: 'gemini_service.dart',
                  code: `Future<Map<String, dynamic>?> extractReservationInfo(
  String userMessage,
) async {
  final response = await sendMessage(prompt);
  try {
    final jsonData = jsonDecode(response);
    return jsonData as Map<String, dynamic>;
  } catch (e) {
    return null;
  }
}`,
                },
                {
                  title: 'auth_provider.dart',
                  code: `Future<bool> restoreSessionFromStorage() async {
  await StorageVersionManager.migrateIfNeeded();
  final existingUser =
      await RobustStorageManager.getCurrentUser();

  if (existingUser != null) {
    state = AuthState(user: existingUser);
    return true;
  }

  return false;
}`,
                },
                {
                  title: 'biometric_auth.dart',
                  code: `Future<bool> authenticate({
  required String reason,
  bool useErrorDialogs = true,
  bool stickyAuth = true,
}) async {
  final didAuthenticate = await _localAuth.authenticate(
    localizedReason: reason,
    options: AuthenticationOptions(
      useErrorDialogs: useErrorDialogs,
      stickyAuth: stickyAuth,
      biometricOnly: true,
    ),
  );

  return didAuthenticate;
}`,
                },
                {
                  title: 'appointments_repository.dart',
                  code: `Future<Map<String, dynamic>> createAppointment({
  required int empresaId,
  required int entidadId,
  required int usuarioEmpresaId,
  required String hora,
  required String fecha,
  required String desCliente,
}) async {
  final resp = await _dio.post<Map<String, dynamic>>(
    'citas',
    queryParameters: {
      'idEmpresa': empresaId,
      'idEntidad': entidadId,
    },
    data: {
      'usuarioEmpresa': {
        'idUsuarioEmpresa': usuarioEmpresaId,
      },
      'hora': hora,
      'fecha': fecha,
      'desCliente': desCliente,
    },
  );

  return resp.data!;
}`,
                },
              ]
              :               [
                {
                  title: 'gemini_service.dart',
                  code: `Future<Map<String, dynamic>?> extractReservationInfo(
  String userMessage,
) async {
  final response = await sendMessage(prompt);
  try {
    final jsonData = jsonDecode(response);
    return jsonData as Map<String, dynamic>;
  } catch (e) {
    return null;
  }
}`,
                },
                {
                  title: 'auth_provider.dart',
                  code: `Future<bool> restoreSessionFromStorage() async {
  await StorageVersionManager.migrateIfNeeded();
  final existingUser =
      await RobustStorageManager.getCurrentUser();

  if (existingUser != null) {
    state = AuthState(user: existingUser);
    return true;
  }

  return false;
}`,
                },
                {
                  title: 'biometric_auth.dart',
                  code: `Future<bool> authenticate({
  required String reason,
  bool useErrorDialogs = true,
  bool stickyAuth = true,
}) async {
  final didAuthenticate = await _localAuth.authenticate(
    localizedReason: reason,
    options: AuthenticationOptions(
      useErrorDialogs: useErrorDialogs,
      stickyAuth: stickyAuth,
      biometricOnly: true,
    ),
  );

  return didAuthenticate;
}`,
                },
                {
                  title: 'appointments_repository.dart',
                  code: `Future<Map<String, dynamic>> createAppointment({
  required int empresaId,
  required int entidadId,
  required int usuarioEmpresaId,
  required String hora,
  required String fecha,
  required String desCliente,
}) async {
  final resp = await _dio.post<Map<String, dynamic>>(
    'citas',
    queryParameters: {
      'idEmpresa': empresaId,
      'idEntidad': entidadId,
    },
    data: {
      'usuarioEmpresa': {
        'idUsuarioEmpresa': usuarioEmpresaId,
      },
      'hora': hora,
      'fecha': fecha,
      'desCliente': desCliente,
    },
  );

  return resp.data!;
}`,
                },
              ]
          ).slice(0, isCompactViewport ? 3 : 4)
        }
        videoSrc="https://assets.jonathancuntodiaz.com/reservo_demo.mp4"
        videoLabel={isEs ? 'Video demo' : 'Demo video'}
        videoFlowLabel={isEs ? 'Flujo MVP' : 'MVP Flow'}
        metricValue={project.technologies.length}
        metricLabel={isEs ? 'Módulos clave' : 'Core modules'}
        stackLabel={isEs ? 'Stack' : 'Stack'}
        showFinalCta={false}
        ctaHeading={isEs ? '¿Quieres ver cómo lo construí?' : 'Curious how I built it?'}
        ctaDescription={
          isEs
            ? 'El repositorio revela las decisiones reales detrás del MVP: IA conversacional, Flutter, Firebase, biometría y arquitectura de estado.'
            : 'The repository shows the real decisions behind the MVP: conversational AI, Flutter, Firebase, biometrics, and state architecture.'
        }
        secondaryAction={{
          label: 'GitHub',
          sublabel: isEs ? 'Ver código' : 'View source',
          href: project.githubUrl ?? '/projects/reservo-ai',
          variant: 'dark',
        }}
      />
    </section>
  )
}
