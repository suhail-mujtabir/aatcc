"use client";

import Link from "next/link";
import { FaFacebook, FaLinkedin, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import GlareHover from "../../components/GlassHover";
import { fall24 } from "@/fall24";

interface Member {
  Timestamp: string;
  Name: string;
  role: string;
  img: string;
  Email: string;
  Phone: string;
  facebook: string;
  LinkedIn: string;
}

// 🔧 Converts JSON into usable structure for your component
const createHofContent = (data: Member[]) => {
  return {
    title: "Hall of Fame- Fall 2024",
    members: data.map((member) => ({
      name: member.Name.trim(),
      designation: member.role,
      img: member.img,
      facebook: member.facebook || "",
      linkedin: member.LinkedIn || "",
      phone: member.Phone || "",
      email: member.Email || "",
    })),
  };
};

const hofContent = createHofContent(fall24);

export default function Fall24() {
  return (
    <section id="hof" className="dark:bg-black bg-gray-100">
      <div className="max-w-6xl mx-auto text-center">
        <Link href="#" className="relative inline-block group mb-8">
          <h2 className="text-4xl font-bold transition-colors duration-500 group-hover:text-green-400 dark:text-white">
            {hofContent.title}
          </h2>
          <span
            aria-hidden
            className="absolute left-1/2 -bottom-1 h-[3px] w-0 bg-green-400 transition-all duration-500 group-hover:w-full group-hover:left-0"
          />
        </Link>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-5">
          {hofContent.members.map((member, idx) => (
            <GlareHover
              key={idx}
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
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-green-200 dark:border-green-600"
                />
                <h3 className="text-xl font-semibold dark:text-white">
                  {member.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4 dark:text-gray-300">
                  {member.designation}
                </p>
                <div className="flex justify-center space-x-4">
                  {member.facebook && (
                    <a
                      href={member.facebook}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label="Facebook"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFacebook size={20} />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      className="text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400"
                      aria-label="LinkedIn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaLinkedin size={20} />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={member.linkedin}
                      className="text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400"
                      aria-label="email"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MdEmail size={20} />
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      aria-label="Phone"
                      rel="noopener noreferrer"
                    >
                      <FaPhoneAlt size={20} />
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`https://wa.me/${member.phone}`}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      aria-label="whatsapp"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp size={20} />
                    </a>
                  )}
                </div>
              </div>
            </GlareHover>
          ))}
        </div>
      </div>
    </section>
  );
}
