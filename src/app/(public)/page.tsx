import Link from "next/link";
import { Mail, User, Package, Users, Check, ChevronRight } from "lucide-react";
import { WhatsAppIcon, InstagramIcon, LinkedInIcon } from "@/components/icons";
import { appConfig, socialLinks } from "@/config";

const impactStats = [
  { value: "1,400+", label: "Lives Impacted" },
  { value: "1,000+", label: "PFA Trainees" },
  { value: "300+", label: "Career Guidance Participants" },
  { value: "10+", label: "Mentees Now Practicing" },
];

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
            <p className="mt-2 text-lg text-gray-500 font-medium">
              {appConfig.founder}
            </p>
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

            {/* Quick Contact */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm">
              <a
                href={`mailto:${socialLinks.email}`}
                className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary-teal)] transition-colors"
              >
                <Mail className="w-5 h-5" />
                {socialLinks.email}
              </a>
              <a
                href={`https://wa.me/91${socialLinks.phone.replace(/\D/g, '').slice(-10)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary-teal)] transition-colors"
              >
                <WhatsAppIcon size={20} />
                WhatsApp
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary-teal)] transition-colors"
              >
                <InstagramIcon size={20} />
                Instagram
              </a>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary-teal)] transition-colors"
              >
                <LinkedInIcon size={20} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--primary-teal)] rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-[var(--secondary-green)] rounded-full opacity-10 blur-3xl" />
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gradient-primary">{stat.value}</div>
                <p className="mt-2 text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
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
                  <User className="w-7 h-7 text-[var(--primary-teal)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Therapy Services</h3>
                <p className="text-gray-600">
                  One-on-one sessions with experienced therapists to address anxiety, depression, trauma, relationship issues, and more.
                </p>
                <Link href="/therapists" className="inline-flex items-center mt-4 text-[var(--primary-teal)] font-medium hover:gap-2 transition-all">
                  Book Session
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Programs */}
            <div className="card group">
              <div className="card-body p-8">
                <div className="w-14 h-14 rounded-xl bg-[var(--secondary-green)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--secondary-green)] transition-colors">
                  <Package className="w-7 h-7 text-[var(--secondary-green)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Professional Programs</h3>
                <p className="text-gray-600">
                  Training, mentorship, and supervision programs for aspiring and practicing mental health professionals.
                </p>
                <Link href="/services/programs" className="inline-flex items-center mt-4 text-[var(--secondary-green)] font-medium hover:gap-2 transition-all">
                  View Programs
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Workshops */}
            <div className="card group">
              <div className="card-body p-8">
                <div className="w-14 h-14 rounded-xl bg-[var(--primary-teal)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--primary-teal)] transition-colors">
                  <Users className="w-7 h-7 text-[var(--primary-teal)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Workshops</h3>
                <p className="text-gray-600">
                  Interactive group sessions on psychological first aid, stress management, career guidance, and mindfulness.
                </p>
                <Link href="/services/workshops" className="inline-flex items-center mt-4 text-[var(--primary-teal)] font-medium hover:gap-2 transition-all">
                  Explore Workshops
                  <ChevronRight className="w-4 h-4 ml-1" />
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
                  { title: "Experienced Professionals", desc: "Our team consists of licensed therapists with diverse specializations and years of experience." },
                  { title: "Personalized Approach", desc: "Every treatment plan is tailored to your unique needs, goals, and circumstances." },
                  { title: "Safe & Confidential Space", desc: "A judgment-free environment where you can express yourself freely and securely." },
                  { title: "Accessible Care", desc: "Online and in-person options to make mental health support accessible to everyone." },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-teal)]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[var(--primary-teal)]" />
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
                  <div className="text-6xl font-bold text-gradient-primary">1,400+</div>
                  <p className="mt-2 text-gray-600">Lives Impacted</p>
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
