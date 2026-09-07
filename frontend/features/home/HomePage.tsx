"use client";

import { useState } from "react";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { QuizTeaser } from "./sections/QuizTeaser";
import { Treatments } from "./sections/Treatments";
import { Results } from "./sections/Results";
import { Differentials } from "./sections/Differentials";
import { Testimonials } from "./sections/Testimonials";
import { FinalCta } from "./sections/FinalCta";
import { Footer } from "./sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import {
  getProcedures,
  getTestimonials,
  getTreatmentOptions,
  getVisibleResults,
} from "@/lib/data";

export function HomePage() {
  const [booking, setBooking] = useState<{ open: boolean; treatment?: string }>(
    {
      open: false,
    },
  );
  const openBooking = (treatment?: string) =>
    setBooking({ open: true, treatment });
  const closeBooking = () => setBooking({ open: false });

  return (
    <>
      <Header onBook={() => openBooking()} />
      <main>
        <Hero onBook={() => openBooking()} />
        <QuizTeaser onBook={openBooking} />
        <Treatments items={getProcedures()} onBook={openBooking} />
        <Results items={getVisibleResults()} onBook={openBooking} />
        <Differentials />
        <Testimonials items={getTestimonials()} />
        <FinalCta onBook={() => openBooking()} />
      </main>
      <Footer />
      <BookingModal
        key={`${booking.open}-${booking.treatment ?? "geral"}`}
        open={booking.open}
        treatment={booking.treatment}
        treatmentOptions={getTreatmentOptions()}
        onClose={closeBooking}
      />
    </>
  );
}
