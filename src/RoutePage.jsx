import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'

const pageContent = {
  collections: {
    kicker: 'NOIR/FORM / COLLECTIONS',
    title: <>The new<br /><em>uniform.</em></>,
    description: 'A study in movement, restraint, and the spaces between. Explore the latest small-run pieces designed for everyday life.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1500&q=85'
  },
  about: {
    kicker: 'NOIR/FORM / THE STUDIO',
    title: <>Clothes with<br /><em>a point of view.</em></>,
    description: 'NOIR/FORM is an independent clothing studio founded by Ama Mensah. We make fewer, better pieces from a small studio in Accra, Ghana.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1500&q=85'
  }
}

const policyContent = {
  privacy: {
    label: 'PRIVACY POLICY',
    title: 'Your privacy matters.',
    sections: [
      ['Information we collect', 'We collect the details you provide at checkout, including your name, email, phone number, delivery address, and order information.'],
      ['How we use information', 'We use your information to process orders, arrange delivery, provide support, and send updates you have requested. We do not sell customer information.'],
      ['Data and security', 'Payment details are handled securely by our payment provider. NOIR/FORM does not store full card details. We keep order information only as long as needed for service and legal requirements.']
    ]
  },
  terms: {
    label: 'TERMS & CONDITIONS',
    title: 'The good-to-know.',
    sections: [
      ['Orders', 'Orders are confirmed once payment has been successfully verified. Product availability is subject to stock at the time of purchase.'],
      ['Pricing and payment', 'All prices are shown in Ghanaian Cedi unless stated otherwise. Sale prices and delivery fees are confirmed before payment.'],
      ['Returns', 'Eligible returns can be requested within 14 days of delivery. Items must be unworn, unwashed, and returned with their original tags attached.']
    ]
  }
}

export default function RoutePage({ page, onShop }) {
  if (page === 'contact') return <main className="standalone-page contact-page"><div><p className="eyebrow">NOIR/FORM / CONTACT</p><h1>Let’s talk<br /><em>clothing.</em></h1><p className="standalone-copy">Questions about a piece, an order, or the studio? We would love to hear from you.</p><div className="contact-details"><a href="mailto:hello@noirform.co"><Mail size={17} /> hello@noirform.co</a><a href="tel:+233200000000"><Phone size={17} /> +233 20 000 0000</a><span><MapPin size={17} /> Accra, Ghana</span></div></div><form className="contact-form" onSubmit={event => { event.preventDefault(); event.currentTarget.reset(); alert('Message sent. We will be in touch soon.') }}><label>Name<input required /></label><label>Email<input type="email" required /></label><label>Message<textarea rows="5" required /></label><button className="button dark">Send message <ArrowRight size={16} /></button></form></main>
  if (page === 'track') return null
  if (policyContent[page]) { const policy = policyContent[page]; return <main className="policy-page standalone-page"><p className="eyebrow">NOIR/FORM / {policy.label}</p><h1>{policy.title}</h1><div className="policy-sections">{policy.sections.map(([heading, copy]) => <section key={heading}><h2>{heading}</h2><p>{copy}</p></section>)}</div><a className="text-link" href="#contact">Questions? Contact us <ArrowRight size={15} /></a></main> }
  const content = pageContent[page]
  return <main className="standalone-page editorial-page"><div className="standalone-copy-block"><p className="eyebrow">{content.kicker}</p><h1>{content.title}</h1><p className="standalone-copy">{content.description}</p><button className="button dark" onClick={onShop}>Shop the collection <ArrowRight size={16} /></button></div><img src={content.image} alt="NOIR/FORM editorial" /></main>
}
