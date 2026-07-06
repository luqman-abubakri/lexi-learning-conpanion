import React from 'react'
import CompanionCard from './components/CompanionCard'
import CompanionList from './components/CompanionList'
import CTA from './components/CTA'

const page = () => {
  return (
    <div className='px-4 md:px-12 pt-6 pb-12 max-w-7xl mx-auto'>
      
      <h1 className='text-2xl md:text-3xl font-bold tracking-tight mb-6 text-neutral-900'>
        Popular Companions
      </h1>
      
      {/* Responsive Grid layout for cards */}
      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
        <CompanionCard
          id="123"
          name="Nuera the Brainy Explorer"
          topic="Neural Network of the Brain"
          subject="science"
          duration={45}
          color="#ffda6e"
        />
        <CompanionCard
          id="456"
          name="Countsy the Number Wizard"
          topic="Derivatives & integrals"
          subject="math"
          duration={30}
          color="#e5d0ff"
        />
        <CompanionCard
          id="789"
          name="Verba the Vocabulary Builder"
          topic="language"
          subject="English Literature"
          duration={30}
          color="#BDE7FF"
        />
      </section>

      {/* Responsive layout for bottom section */}
      <section className='flex flex-col lg:flex-row lg:items-start justify-between gap-8 pt-6 border-t border-neutral-100'>
        <div className="w-full lg:grow">
          <CompanionList/>
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <CTA/>
        </div>
      </section>
      
    </div>
  )
}

export default page
