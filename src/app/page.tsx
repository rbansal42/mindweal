import Link from "next/link";
import { appConfig } from "@/config";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-white via-[#f0fdf9] to-[#f5f3ff]">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-gradient-mixed">{appConfig.name}</span>
            </h1>
            <p className="mt-4 text-2xl md:text-3xl font-medium text-gray-700">
              {appConfig.tagline}
            </p>
            <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
              Your journey to mental wellness begins here. We provide compassionate,
              professional mental health services tailored to your unique needs.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/therapists" className="btn btn-primary text-lg px-8 py-4">
                Book a Session
              </Link>
              <Link href="/about" className="btn btn-outline text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--primary-teal)] rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-[var(--primary-purple)] rounded-full opacity-10 blur-3xl" />
      </section>

      {/* Services Overview */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              How We Can <span className="text-gradient-primary">Help</span>
            </h2>
            <p className="mt-4 text-gray-600">
              Comprehensive mental health support designed around your unique journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Individual Therapy */}
            <div className="card group">
              <div className="card-body p-8">
                <div className="w-14 h-14 rounded-xl bg-[var(--primary-teal)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--primary-teal)] transition-colors">
                  <svg className="w-7 h-7 text-[var(--primary-teal)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Individual Therapy</h3>
                <p className="text-gray-600">
                  One-on-one sessions with experienced therapists to address your personal challenges and goals.
                </p>
                <Link href="/therapists" className="inline-flex items-center mt-4 text-[var(--primary-teal)] font-medium hover:gap-2 transition-all">
                  Book Session
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Programs */}
            <div className="card group">
              <div className="card-body p-8">
                <div className="w-14 h-14 rounded-xl bg-[var(--primary-purple)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--primary-purple)] transition-colors">
                  <svg className="w-7 h-7 text-[var(--primary-purple)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Therapeutic Programs</h3>
                <p className="text-gray-600">
                  Structured programs designed to help you develop lasting coping strategies and skills.
                </p>
                <Link href="/services/programs" className="inline-flex items-center mt-4 text-[var(--primary-purple)] font-medium hover:gap-2 transition-all">
                  View Programs
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Workshops */}
            <div className="card group">
              <div className="card-body p-8">
                <div className="w-14 h-14 rounded-xl bg-[var(--secondary-green)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--secondary-green)] transition-colors">
                  <svg className="w-7 h-7 text-[var(--secondary-green)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Workshops</h3>
                <p className="text-gray-600">
                  Interactive group sessions focused on specific topics like stress management and mindfulness.
                </p>
                <Link href="/services/workshops" className="inline-flex items-center mt-4 text-[var(--secondary-green)] font-medium hover:gap-2 transition-all">
                  Explore Workshops
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section section-alt">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Why Choose <span className="text-gradient-mixed">{appConfig.name}</span>?
              </h2>
              <p className="mt-6 text-gray-600 text-lg">
                We believe in a holistic approach to mental wellness, combining evidence-based
                practices with compassionate care.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  { title: "Experienced Professionals", desc: "Our team consists of licensed therapists with diverse specializations." },
                  { title: "Personalized Approach", desc: "Every treatment plan is tailored to your unique needs and goals." },
                  { title: "Safe Space", desc: "A judgment-free environment where you can express yourself freely." },
                  { title: "Flexible Scheduling", desc: "Book sessions that fit your schedule, including online options." },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-teal)]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[var(--primary-teal)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl gradient-primary opacity-20" />
              <div className="absolute inset-4 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl font-bold text-gradient-primary">100+</div>
                  <p className="mt-2 text-gray-600">Lives Transformed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-[var(--primary-teal)] to-[var(--secondary-green)] text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Begin Your Journey?
          </h2>
          <p className="mt-4 text-xl opacity-90 max-w-2xl mx-auto">
            Take the first step towards a healthier mind. Our team is here to support you every step of the way.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/therapists" className="btn bg-white text-[var(--primary-teal)] hover:bg-gray-100 text-lg px-8 py-4">
              Find a Therapist
            </Link>
            <Link href="/contact" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
