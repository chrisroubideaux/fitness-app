// components/events/page.tsx
'use client';

import Nav from '@/components/navbar/Nav';
import EventsHero from '@/components/events/EventsHero';
import FeaturedEvents from '@/components/events/FeaturedEvents';
import EventCategories from '@/components/events/EventCategories';
import EventsCTA from '@/components/events/EventsCTA';
import TrainerFooter from '@/components/admin/trainers/TrainerFooter';

export default function EventsPage() {
  return (
    <>
      <Nav />
      <EventsHero />
      <FeaturedEvents />
      <EventCategories />
      <EventsCTA />
      <TrainerFooter />
    </>
  );
}