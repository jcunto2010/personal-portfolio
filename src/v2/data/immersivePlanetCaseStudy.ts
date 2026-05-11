import type { PlanetId } from '../solar/planetRegistry'
import {
  CINEMATIC_MOCK_VIDEO_SCALE,
  CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_BOOST,
  CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_EXTRA_Y,
  CINEMATIC_MOCK_VIDEO_SCALE_X_RATIO,
  CINEMATIC_MOCK_VIDEO_SCALE_Y_RATIO,
} from '../../components/ui/cinematic-landing-hero'

export interface ImmersiveCaseStudyCodeFile {
  filename: string
  language: string
  code: string
}

export interface ImmersivePlanetCaseStudy {
  codeFiles: ImmersiveCaseStudyCodeFile[]
  video: {
    src: string
    videoTranslateXPx?: number
    videoScale?: number
    videoScaleXRatio?: number
    videoScaleYRatio?: number
  }
}

const RESERVO_SNIPPETS: ImmersiveCaseStudyCodeFile[] = [
  {
    filename: 'gemini_service.dart',
    language: 'dart',
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
    filename: 'auth_provider.dart',
    language: 'dart',
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
    filename: 'biometric_auth.dart',
    language: 'dart',
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
    filename: 'appointments_repository.dart',
    language: 'dart',
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

const STARTUP_SNIPPETS: ImmersiveCaseStudyCodeFile[] = [
  {
    filename: 'SwipeCard.tsx',
    language: 'typescript',
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
    filename: 'api.ts',
    language: 'typescript',
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

const MOON_VIDEO = {
  src: 'https://assets.jonathancuntodiaz.com/reservo_demo.mp4',
} as const

const MARS_VIDEO_BASE = CINEMATIC_MOCK_VIDEO_SCALE + CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_BOOST
const MARS_VIDEO = {
  src: 'https://assets.jonathancuntodiaz.com/startup_demo.mp4',
  videoTranslateXPx: 1,
  videoScale: MARS_VIDEO_BASE,
  videoScaleXRatio: CINEMATIC_MOCK_VIDEO_SCALE_X_RATIO,
  videoScaleYRatio:
    (CINEMATIC_MOCK_VIDEO_SCALE *
      CINEMATIC_MOCK_VIDEO_SCALE_Y_RATIO *
      CINEMATIC_MOCK_VIDEO_SCALE_STARTUP_EXTRA_Y) /
    MARS_VIDEO_BASE,
} as const

export function getImmersivePlanetCaseStudy(
  planetId: PlanetId,
  /** Match classic mode: fewer tabs in the snippet switcher below `lg`. */
  compactViewport: boolean,
): ImmersivePlanetCaseStudy | null {
  if (planetId === 'moon') {
    return {
      video: { ...MOON_VIDEO },
      codeFiles: RESERVO_SNIPPETS.slice(0, compactViewport ? 3 : 4),
    }
  }
  if (planetId === 'mars') {
    return {
      video: { ...MARS_VIDEO },
      codeFiles: STARTUP_SNIPPETS,
    }
  }
  return null
}
