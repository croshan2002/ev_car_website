import { SITE } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="footer">
      <span>
        © {new Date().getFullYear()} {SITE.org}. Concept product page.
      </span>
      <span>
        3D model:{' '}
        <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept" target="_blank" rel="noopener noreferrer">
          “Car Concept”
        </a>{' '}
        by Eric Chadwick / Darmstadt Graphics Group,{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer license">
          CC BY 4.0
        </a>
        , modified.
      </span>
    </footer>
  )
}
