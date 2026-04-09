import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Phone, Send, ArrowRight, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@microgig.com', color: '#6366f1' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210', color: '#8b5cf6' },
    { icon: MapPin, label: 'Location', value: 'Bangalore, India', color: '#06b6d4' },
    { icon: MessageSquare, label: 'Support', value: 'Mon-Fri, 9am-6pm IST', color: '#10b981' },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" style={{ top: '5%', right: '-10%' }} />
        <div className="blob blob-3" style={{ bottom: '10%', left: '-5%' }} />
        <div className="grid-pattern" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Mail className="w-4 h-4 text-accent" />
            <span className="text-sm text-dark-300">Get in Touch</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Let's <span className="gradient-text">talk</span>
          </h1>
          <p className="text-lg text-dark-400 max-w-xl mx-auto">Have a question, partnership idea, or just want to say hi? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
            {contactInfo.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-card p-5 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${color}12` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wider font-medium">{label}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{value}</p>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="glass-card p-1 overflow-hidden mt-6">
              <div className="w-full h-48 rounded-[16px] bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="grid-pattern" />
                </div>
                <div className="text-center relative z-10">
                  <MapPin className="w-8 h-8 text-accent mx-auto mb-2" style={{ animation: 'float-gentle 3s ease-in-out infinite' }} />
                  <p className="text-sm text-dark-400">Bangalore, India</p>
                  <p className="text-xs text-dark-500">HSR Layout, 560102</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3">
            <div className="glass-card p-8">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4" style={{ animation: 'glow-pulse 2s ease infinite' }}>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message sent!</h3>
                  <p className="text-dark-400">We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark-300 mb-2 block">Name</label>
                      <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark-300 mb-2 block">Email</label>
                      <input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-300 mb-2 block">Subject</label>
                    <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-300 mb-2 block">Message</label>
                    <textarea rows={5} placeholder="Tell us more..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="input-field resize-none" required />
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 magnetic-hover group">
                    Send Message
                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
