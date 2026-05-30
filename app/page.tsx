import Hero from "@/components/Hero";
import About from "@/components/About";
import Purpose from "@/components/Purpose";
import Testimonials from "@/components/Testimonials";
import Partners from "@/components/Partners";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Purpose />
      <Testimonials />
      <Partners />
      <CallToAction />
    </main>
  );
}
