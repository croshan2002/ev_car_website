import Experience from '@/components/Experience'
import { jsonLd } from '@/lib/site'

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can never close the script tag early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, '\\u003c') }}
      />
      <Experience />
    </>
  )
}
