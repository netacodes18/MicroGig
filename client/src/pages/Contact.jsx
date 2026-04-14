import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Phone, Send, CheckCircle } from 'lucide-react';

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
    { icon: Mail, label: 'EMAIL', value: 'HELLO@MICROGIG.COM', color: '#2563eb' },
    { icon: Phone, label: 'PHONE', value: '+91 98765 43210', color: '#ec4899' },
    { icon: MapPin, label: 'LOCATION', value: 'BANGALORE, INDIA', color: '#22c55e' },
    { icon: MessageSquare, label: 'SUPPORT', value: 'MON-FRI, 9AM-6PM IST', color: '#000000' },
  ];

  return (
    <div className="min-h-screen da-grid-bg pt-12 pb-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-20 pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
              <span className="w-8 h-[2px] bg-gray-200"></span>
              CONTACT US
              <span className="w-8 h-[2px] bg-gray-200"></span>
            </div>
            <h1 className="text-4xl xs:text-5xl md:text-7xl font-bold mb-6 text-black tracking-tight leading-none text-center">
              GET IN<br/>
              <span className="da-blue-text italic">TOUCH</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl text-center font-medium leading-relaxed">
              Have a question, partnership idea, or just want to say hi? <br className="hidden md:block"/>
              We usually respond within 24 hours.
            </p>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Contact Info Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {contactInfo.map(({ icon: Icon, label, value, color }) => (
              <div 
                key={label} 
                className="bg-white border-2 border-black p-8 relative group hover:-translate-y-1 hover:translate-x-1 transition-transform da-shadow-black"
              >
                {/* Accent corner */}
                <div 
                  className="absolute top-0 right-0 w-4 h-4 border-l-2 border-b-2 border-black" 
                  style={{ backgroundColor: color }}
                />
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 border-2 border-black bg-white">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-xs font-black tracking-[0.2em] text-gray-400">{label}</h3>
                </div>
                <p className="text-lg font-bold text-black tracking-tight">{value}</p>
              </div>
            ))}

            {/* Map Placeholder Card */}
            <div 
              className="bg-black text-white border-2 border-black p-8 mt-12 relative overflow-hidden da-shadow-pink"
            >
              <div className="relative z-10">
                <h3 className="text-xs font-black tracking-[0.2em] text-gray-500 mb-4">HEADQUARTERS</h3>
                <p className="text-xl font-bold mb-1">BANGALORE, INDIA</p>
                <p className="text-gray-400 text-sm font-medium">HSR Layout, Sector 2, 560102</p>
              </div>
              {/* Abstract brutalist shape */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rotate-12 border-2 border-white/20" />
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div 
              className="bg-white border-2 border-black p-10 md:p-12 da-shadow-lg-black"
            >
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="text-center py-20 flex flex-col items-center"
                >
                  <div className="w-24 h-24 border-4 border-black flex items-center justify-center mb-8 bg-[#22c55e]">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Message Sent</h2>
                  <p className="text-gray-600 font-bold text-lg">WE'LL GET BACK TO YOU SOON.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-12 da-btn-outline"
                  >
                    SEND ANOTHER ONE
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black tracking-widest text-black uppercase">FULL NAME</label>
                      <input 
                        type="text" 
                        placeholder="e.g., John Doe" 
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})} 
                        className="w-full bg-white border-2 border-black p-4 text-black font-bold placeholder:text-gray-300 focus:bg-gray-50 transition-colors focus:outline-none" 
                        required 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black tracking-widest text-black uppercase">EMAIL ADDRESS</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com" 
                        value={form.email} 
                        onChange={e => setForm({...form, email: e.target.value})} 
                        className="w-full bg-white border-2 border-black p-4 text-black font-bold placeholder:text-gray-300 focus:bg-gray-50 transition-colors focus:outline-none" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-black tracking-widest text-black uppercase">SUBJECT</label>
                    <input 
                      type="text" 
                      placeholder="What is this regarding?" 
                      value={form.subject} 
                      onChange={e => setForm({...form, subject: e.target.value})} 
                      className="w-full bg-white border-2 border-black p-4 text-black font-bold placeholder:text-gray-300 focus:bg-gray-50 transition-colors focus:outline-none" 
                      required 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black tracking-widest text-black uppercase">MESSAGE</label>
                    <textarea 
                      rows={6} 
                      placeholder="Tell us everything..." 
                      value={form.message} 
                      onChange={e => setForm({...form, message: e.target.value})} 
                      className="w-full bg-white border-2 border-black p-4 text-black font-bold placeholder:text-gray-300 focus:bg-gray-50 transition-colors focus:outline-none resize-none" 
                      required 
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit" 
                      className="da-btn-primary w-full md:w-auto md:px-12 py-5 text-sm"
                    >
                      SEND MESSAGE
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
