'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { fall24 } from '@/fall24';
import TeamCard from '@/components/contact/TeamCard';

export default function ContactPage() {
  // Filter members by role
  const coreLeadership = fall24.filter(member =>
    ['Chairperson', 'Vice Chairperson', 'Secretary', 'Treasurer'].includes(member.role)
  );

  const prSponsor = fall24.filter(member =>
    member.role === 'Sponsor and PR Coordinator'
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
        </div>
      </section>

      {/* General Contact Info Section */}
      <section className="py-12 px-6 bg-gray-100 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Contact Details Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-white/20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get In Touch</h2>

              {/* Email */}
              <div className="flex items-start gap-4 mb-6">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Email</p>
                  <a
                    href="mailto:aatccaust@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    aatccaust@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 mb-6">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Phone</p>
                  <a
                    href="tel:+8801316353596"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    +880 1316-353596
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Office</p>
                  <p className="text-gray-900 dark:text-white">
                    Ahsanullah University of Science and Technology<br />
                    141 & 142, Love Road, Tejgaon Industrial Area<br />
                    Dhaka-1208, Bangladesh
                  </p>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-white/20">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1825.769826415775!2d90.40453274442747!3d23.763790100000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c790e6cf50a9%3A0xcae56c17297f85f8!2sAhsanullah%20University%20of%20Science%20and%20Technology!5e0!3m2!1sen!2sbd!4v1764250546530!5m2!1sen!2sbd"
                width="600"
                height="450"
                style={{ border: 0, minHeight: '300px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Core Leadership Section */}
      <section className="py-12 px-6 bg-gray-100 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Contact us
            </h2>
            <div className="h-px bg-gradient-to-r from-blue-500 via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coreLeadership.map(member => (
              <TeamCard key={member.Email} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* PR & Sponsor Section */}
      <section className="py-12 px-6 bg-gray-100 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Interested in Collaboration | Sponsor
            </h2>
            <div className="h-px bg-gradient-to-r from-blue-500 via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prSponsor.map(member => (
              <TeamCard key={member.Email} member={member} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
