import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactSection() {
  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6 text-accent-blue" />,
      title: "Call Us",
      value: "+91 7019650179",
      href: "tel:+917019650179"
    },
    {
      icon: <Mail className="h-6 w-6 text-accent-mint" />,
      title: "Email Us",
      value: "shreyas@gmail.com",
      href: "mailto:shreyas@gmail.com"
    }
  ];

  return (
    <section id="contact" className="relative w-full bg-[#fbfcfc] py-24 md:py-32 overflow-hidden border-t border-black/5">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="mb-4 font-outfit text-3xl font-bold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
              Get in <span className="text-gradient">Touch</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-text-secondary">
              Reach out to our leadership directly for partnerships, support, or inquiries regarding our global operations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-16 flex flex-wrap justify-center gap-6 w-full max-w-4xl"
          >
            {contactInfo.map((info, idx) => (
              <a
                key={idx}
                href={info.href}
                className="group relative flex w-full max-w-sm cursor-pointer flex-col items-center justify-center rounded-3xl border border-black/5 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:w-[calc(50%-1.5rem)]"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 transition-transform duration-300 group-hover:scale-110">
                  {info.icon}
                </div>
                <h3 className="mb-2 font-outfit text-xl font-bold text-text-primary">{info.title}</h3>
                <p className="text-lg font-medium text-text-secondary transition-colors group-hover:text-accent-primary">
                  {info.value}
                </p>
              </a>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
