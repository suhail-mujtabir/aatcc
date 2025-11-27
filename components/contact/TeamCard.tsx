'use client';

import { FaFacebook, FaLinkedin, FaPhoneAlt, FaWhatsapp} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import GlareHover from '@/components/GlassHover';

interface TeamMember {
  Timestamp: string;
  Email: string;
  Name: string;
  Phone: string;
  role: string;
  img: string;
  facebook: string;
  LinkedIn: string;
}

interface TeamCardProps {
  member: TeamMember;
}

export default function TeamCard({ member }: TeamCardProps) {
  // Format phone for WhatsApp (remove leading 0, add country code)
  const formatWhatsAppNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
    if (cleaned.startsWith('0')) {
      return '880' + cleaned.substring(1); // Bangladesh country code
    }
    return cleaned;
  };
  
  const whatsappNumber = formatWhatsAppNumber(member.Phone);
  
  return (
    <GlareHover
      width="100%"
      height="auto"
      background="transparent"
      borderRadius="1rem"
      borderColor="transparent"
      glareColor="#ffffff"
      glareOpacity={0.2}
      glareAngle={-45}
      glareSize={200}
      transitionDuration={500}
      playOnce={false}
      className="dark:bg-dark-panel p-6 bg-white shadow-lg rounded-2xl hover:shadow-xl transition dark:shadow-white/20"
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* Profile Photo - Circular like Fall2024 */}
        <img
          src={member.img}
          alt={member.Name}
          className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-green-200 dark:border-green-600"
        />
        
        {/* Name */}
        <h3 className="text-xl font-semibold dark:text-white text-gray-900 text-center">
          {member.Name}
        </h3>
        
        {/* Role */}
        <p className="text-gray-500 text-sm mb-4 dark:text-gray-300 text-center">
          {member.role}
        </p>
        
        {/* Contact Icons */}
        <div className="flex justify-center space-x-4">
          {/* Email */}
          <a
            href={`mailto:${member.Email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label="Email"
          >
            <MdEmail size={20} />
          </a>
          
          {/* Phone */}
          <a
            href={`tel:${member.Phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            aria-label="Phone"
          >
            <FaPhoneAlt size={20} />
          </a>
          
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            aria-label="WhatsApp"
          >
            <FaWhatsapp size={20} />
          </a>
          
          {/* Facebook - Only show if link exists */}
          {member.facebook && (
            <a
              href={member.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label="Facebook"
            >
              <FaFacebook size={20} />
            </a>
          )}
          
          {/* LinkedIn - Only show if link exists */}
          {member.LinkedIn && (
            <a
              href={member.LinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={20} />
            </a>
          )}
        </div>
      </div>
    </GlareHover>
  );
}
