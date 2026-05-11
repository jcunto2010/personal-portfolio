import { ClassicRebuildPage } from '../../components/ClassicRebuild/ClassicRebuildPage'

/**
 * Home — Cosmic Editorial
 *
 * Editorial content is composed from ClassicRebuild and data modules
 * (e.g. experience, projects, contact under `src/v2/data`).
 *
 * Internal chapter navigation uses programmatic scroll (`scrollToChapter`) instead
 * of native hash anchors so chapter IDs never collide with the URL path.
 *
 * To deep-link to a chapter, append ?chapter=<id> to the Home route:
 *   /?chapter=chapter-notes
 */
export default function HomeV2() {
  return <ClassicRebuildPage />
}
