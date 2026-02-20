import React from 'react'
import { SiFlutter, SiFirebase, SiGoogle } from 'react-icons/si'
import { CaseStudyLayout } from '../layout/CaseStudyLayout'
import { TechStackOrbit } from '../components/TechStackOrbit'
import { CodeShowcase } from '../components/CodeShowcase'
import { ImpactMetrics } from '../components/ImpactMetrics'
import FlowStepper from '../../../components/shared/FlowStepper'

const RIVERPOD_SNIPPET = `// Reservo.AI – Booking state with Riverpod
final bookingProvider = StateNotifierProvider<
  BookingNotifier, BookingState>((ref) {
  return BookingNotifier(ref.read(firestoreProvider));
});

class BookingNotifier extends StateNotifier<BookingState> {
  BookingNotifier(this._firestore) : super(BookingState.initial());

  final FirebaseFirestore _firestore;

  Future<void> bookSlot(String shopId, DateTime slot) async {
    state = state.copyWith(status: BookingStatus.loading);
    try {
      await _firestore.collection('bookings').add({
        'shopId': shopId,
        'slot': slot.toIso8601String(),
        'userId': ref.read(authProvider).uid,
      });
      state = state.copyWith(status: BookingStatus.success);
    } catch (e, st) {
      state = state.copyWith(status: BookingStatus.failure, error: e);
    }
  }
}`

const RESERVO_METRICS = [
  { id: '1', value: '1', label: 'Unified AI assistant', description: 'Single conversational interface for booking and suggestions' },
  { id: '2', value: '2', label: 'Platforms (iOS & Android)', description: 'Single Flutter codebase, native performance' },
  { id: '3', value: '100%', label: 'Biometric auth coverage', description: 'Secure login and sensitive actions with Rive animations' },
]

const RESERVO_FLOW_STEPS = [
  { id: '1', label: 'Launch & Auth', description: 'Splash, SignUp or Login.', isPrimary: true },
  { id: '2', label: 'Main Dashboard', description: 'Central hub for all features.', isPrimary: false },
  { id: '3', label: 'AI Assistant', description: 'Gemini-powered conversational booking.', isPrimary: true },
  { id: '4', label: 'Booking Flow', description: 'Search → Service → Time → Confirm.', isPrimary: false },
  { id: '5', label: 'Confirmation', description: 'Review and reminders.', isPrimary: true },
]

export const ReservoCaseStudy: React.FC = () => {
  const orbitItems = [
    { id: 'flutter', label: 'Flutter', color: '#02569B', icon: <SiFlutter className="text-xl" /> },
    { id: 'firebase', label: 'Firebase', color: '#FFCA28', icon: <SiFirebase className="text-xl" /> },
    { id: 'gemini', label: 'Gemini AI', color: '#8E75B2', icon: <SiGoogle className="text-xl" /> },
  ]

  return (
    <CaseStudyLayout
      title="Reservo.AI"
      subtitle="AI-powered appointment booking platform with conversational interface and biometric auth."
      badge="Mobile Application"
      accent="violet"
      architectureOverlay={
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <FlowStepper accentColor="violet" steps={RESERVO_FLOW_STEPS} />
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-20">
        <section>
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">Tech stack</h3>
          <p className="text-gray-400 font-body mb-8">
            How Flutter, Firebase, and Gemini AI interact in the product.
          </p>
          <TechStackOrbit items={orbitItems} centerLabel="Reservo.AI" />
        </section>

        <section>
          <CodeShowcase
            code={RIVERPOD_SNIPPET}
            language="dart"
            title="State management: Riverpod"
            caption="Booking flow and Firestore integration via StateNotifier; auth and firestore injected with ref.read."
            highlightLines={[2, 3, 4, 15, 16]}
          />
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">Result-oriented KPIs</h3>
          <ImpactMetrics metrics={RESERVO_METRICS} columns={3} />
        </section>
      </div>
    </CaseStudyLayout>
  )
}
