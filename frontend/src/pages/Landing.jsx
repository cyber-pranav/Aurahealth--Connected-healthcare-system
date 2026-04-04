import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-elevation-1">
              <span className="material-symbols-outlined filled text-on-primary text-xl">cardiology</span>
            </div>
            <span className="text-xl font-bold text-on-surface tracking-tight">Aura Health</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary-container/30 
              rounded-full transition-all duration-200">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-medium bg-primary text-on-primary 
              rounded-full hover:bg-primary/90 transition-all duration-200 shadow-elevation-1">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/40 
            text-on-primary-container text-sm font-medium mb-8">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Intelligent Healthcare Coordination
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
            Healthcare
            <br />
            <span className="gradient-text">Reimagined.</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            Seamless coordination between patients and doctors. 
            Unified medical records, smart medication tracking, and real-time communication — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-3.5 bg-primary text-on-primary rounded-full text-base font-semibold 
              hover:bg-primary/90 transition-all duration-300 shadow-elevation-2 hover:shadow-elevation-3
              flex items-center gap-2">
              Start Your Journey
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
            <Link to="/login" className="px-8 py-3.5 border-2 border-outline-variant text-on-surface rounded-full text-base 
              font-semibold hover:border-primary hover:text-primary transition-all duration-300
              flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">login</span>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-surface-container-low">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-4">
              Everything You Need
            </h2>
            <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
              A complete platform designed to solve real coordination challenges in modern healthcare.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: 'event_available',
                title: 'Smart Scheduling',
                desc: 'Book appointments with doctors, receive automated reminders, and manage your care calendar effortlessly.',
                color: 'bg-primary-container text-on-primary-container'
              },
              {
                icon: 'medical_information',
                title: 'Unified Records',
                desc: 'All medical records, prescriptions, and consultation history in one secure, accessible location.',
                color: 'bg-secondary-container text-on-secondary-container'
              },
              {
                icon: 'medication',
                title: 'Med Tracking',
                desc: 'Smart medication reminders with adherence scoring. Never miss a dose again.',
                color: 'bg-tertiary-container text-on-tertiary-container'
              },
              {
                icon: 'chat_bubble',
                title: 'Real-time Chat',
                desc: 'Secure, structured messaging between patients and doctors with full history.',
                color: 'bg-primary-container text-on-primary-container'
              },
              {
                icon: 'monitor_heart',
                title: 'Proactive Care',
                desc: 'Automated non-adherence alerts for doctors and follow-up reminders for patients.',
                color: 'bg-secondary-container text-on-secondary-container'
              },
              {
                icon: 'shield_with_heart',
                title: 'Continuity of Care',
                desc: 'Complete patient context for every consultation. Full history at your fingertips.',
                color: 'bg-tertiary-container text-on-tertiary-container'
              }
            ].map((feature, i) => (
              <div key={i} className={`p-6 rounded-3xl bg-surface-container-lowest shadow-elevation-1 
                hover:shadow-elevation-3 transition-all duration-300 hover:-translate-y-1
                animate-fade-in stagger-${i + 1}`}>
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined filled text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-2">{feature.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-primary to-primary-light relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-on-primary mb-4">Ready to Transform Your Care?</h2>
              <p className="text-on-primary/80 mb-8 text-lg">
                Join healthcare professionals and patients who trust Aura for better coordination.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-on-primary text-primary 
                rounded-full font-semibold hover:bg-white/90 transition-all duration-300 shadow-elevation-2">
                Create Free Account
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-outline-variant/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-base filled text-primary">cardiology</span>
            Aura Health Systems © 2026
          </div>
          <p className="text-on-surface-variant text-sm">Built with ❤️ for better healthcare</p>
        </div>
      </footer>
    </div>
  );
}
