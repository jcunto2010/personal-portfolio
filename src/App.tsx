import Header from './components/Header'
import Hero from './components/Hero'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { DeveloperModeProvider } from './features/case-studies/context/DeveloperModeContext'

function App() {
  return (
    <DeveloperModeProvider>
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </div>
    </DeveloperModeProvider>
  )
}

export default App
