// Single source of truth for page copy that search engines and AI answer engines read.
// The visible Specs + FAQ sections, JSON-LD, llms.txt and metadata all come from here,
// so the structured data can never drift from what visitors actually see.
import { PAINTS, TRIMS, WHEELS, lakh } from './store'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const SITE = {
  name: 'VOLTA Arc',
  brand: 'VOLTA',
  org: 'VOLTA Motors',
  title: 'VOLTA Arc — Electric grand tourer | 640 km range, 18-min charge',
  description:
    'VOLTA Arc is a five-seat all-electric grand tourer with up to 640 km range (ARAI), 0–100 km/h in 3.2 s and 10–80% charging in 18 minutes. Ex-showroom from ₹54.90 lakh. Configure yours in 3D and reserve for ₹25,000.',
  keywords: [
    'VOLTA Arc',
    'electric car India',
    'electric grand tourer',
    'EV 640 km range',
    'fast charging EV',
    '800-volt electric car',
    'AWD electric car',
    'EV price in India',
    'electric car configurator',
    'reserve electric car',
  ],
  locale: 'en_IN',
  reservation: 25000,
  peakCharge: 350,
  chargeMinutes: 18,
  seats: 5,
  boot: 620,
  dragCd: 0.21,
}

const low = Math.min(...TRIMS.map((t) => t.price))
const high = Math.max(...TRIMS.map((t) => t.price))
const best = TRIMS.reduce((a, t) => (t.range > a.range ? t : a))
const fastest = TRIMS.reduce((a, t) => (t.sprint < a.sprint ? t : a))

const lakhWord = (n) => lakh(n).replace(/ L$/, ' lakh')
export const PRICE_RANGE = { low, high, lowText: lakhWord(low), highText: lakhWord(high) }

export const HIGHLIGHTS = [
  { k: `Cd ${SITE.dragCd}`, text: 'One unbroken line from nose to tail, flush handles and a sealed underbody.' },
  { k: 'LED light blade', text: 'A 1.5-metre front light bar with 2,400 pixels that dips itself for oncoming traffic.' },
  { k: 'Full-width tail light', text: `Edge-to-edge rear light; the hatch opens to ${SITE.boot} litres with the seats up.` },
  { k: 'Glass roof', text: '2.1 m² of laminated glass that blocks 99% of UV and dims at a touch.' },
  { k: '800-volt platform', text: `Up to ${SITE.peakCharge} kW DC charging, 10–80% in ${SITE.chargeMinutes} minutes.` },
]

export const FAQ = [
  {
    q: 'What is the range of the VOLTA Arc?',
    a: `Up to ${best.range} km on one charge (ARAI) with the ${best.name}. The ${TRIMS.map((t) => `${t.name} is rated at ${t.range} km`).join(', ')}.`,
  },
  {
    q: 'How fast does the VOLTA Arc charge?',
    a: `10–80% in about ${SITE.chargeMinutes} minutes on a ${SITE.peakCharge} kW DC fast charger, thanks to its 800-volt platform.`,
  },
  {
    q: 'What is the price of the VOLTA Arc in India?',
    a: `Ex-showroom prices start at ${PRICE_RANGE.lowText} for the ${TRIMS[0].name} and go up to ${PRICE_RANGE.highText} for the ${TRIMS[TRIMS.length - 1].name}, before paint and wheel options.`,
  },
  {
    q: 'How quick is the VOLTA Arc from 0 to 100 km/h?',
    a: `The ${fastest.name} reaches 100 km/h in ${fastest.sprint} seconds with ${fastest.power} kW. ${TRIMS.filter((t) => t !== fastest)
      .map((t) => `The ${t.name} takes ${t.sprint} s`)
      .join(' and ')}.`,
  },
  {
    q: 'How many people and how much luggage does it carry?',
    a: `It seats ${SITE.seats} adults and has ${SITE.boot} litres of boot space with the rear seats up.`,
  },
  {
    q: 'Which colours and wheels can I choose?',
    a: `${PAINTS.length} paints (${PAINTS.map((p) => p.name).join(', ')}) and ${WHEELS.length} wheel designs (${WHEELS.map((w) => w.name).join(', ')}).`,
  },
  {
    q: 'How do I reserve a VOLTA Arc?',
    a: `Configure your car on this page and reserve it for ₹${SITE.reservation.toLocaleString('en-IN')}, fully refundable. A VOLTA host calls you within a day to book a test drive.`,
  },
]

export function jsonLd() {
  const org = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#org`,
    name: SITE.org,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
  }
  const car = {
    '@type': ['Product', 'Car'],
    '@id': `${SITE_URL}/#car`,
    name: SITE.name,
    description: SITE.description,
    image: `${SITE_URL}/opengraph-image`,
    url: SITE_URL,
    brand: { '@type': 'Brand', name: SITE.brand },
    manufacturer: { '@id': `${SITE_URL}/#org` },
    category: 'Electric car',
    bodyType: 'Liftback grand tourer',
    fuelType: 'Electric',
    vehicleSeatingCapacity: SITE.seats,
    seatingCapacity: SITE.seats,
    cargoVolume: { '@type': 'QuantitativeValue', value: SITE.boot, unitCode: 'LTR' },
    accelerationTime: { '@type': 'QuantitativeValue', value: fastest.sprint, unitCode: 'SEC', valueReference: '0-100 km/h' },
    vehicleEngine: {
      '@type': 'EngineSpecification',
      engineType: 'Electric motor',
      enginePower: { '@type': 'QuantitativeValue', value: fastest.power, unitCode: 'KWT' },
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Range (ARAI)', value: best.range, unitText: 'km' },
      { '@type': 'PropertyValue', name: 'DC fast charging peak', value: SITE.peakCharge, unitText: 'kW' },
      { '@type': 'PropertyValue', name: '10–80% charge time', value: SITE.chargeMinutes, unitText: 'min' },
      { '@type': 'PropertyValue', name: 'Drag coefficient', value: SITE.dragCd },
    ],
    model: TRIMS.map((t) => ({
      '@type': 'ProductModel',
      name: `${SITE.name} ${t.name}`,
      offers: { '@type': 'Offer', price: t.price, priceCurrency: 'INR', availability: 'https://schema.org/PreOrder' },
    })),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: low,
      highPrice: high,
      offerCount: TRIMS.length,
      availability: 'https://schema.org/PreOrder',
      seller: { '@id': `${SITE_URL}/#org` },
    },
  }
  const faq = {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
  const page = {
    '@type': 'WebPage',
    '@id': `${SITE_URL}/#page`,
    url: SITE_URL,
    name: SITE.title,
    description: SITE.description,
    inLanguage: 'en-IN',
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, name: SITE.name, url: SITE_URL, publisher: { '@id': `${SITE_URL}/#org` } },
    about: { '@id': `${SITE_URL}/#car` },
    mainEntity: { '@id': `${SITE_URL}/#car` },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.hero__copy .lead', '#specs .lead', '#faq dd'] },
  }
  return { '@context': 'https://schema.org', '@graph': [org, page, car, faq] }
}
