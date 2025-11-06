import Link from "next/link";
import { FaFacebook, FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import GlareHover from "../GlassHover";

const hofContent = {
  title: "Hall of Fame",
  members: [
    {
      name: "Abir Hossain Nishan",
      designation: "Chairperson",
      img: "/abir.jpg",
      facebook: "https://www.facebook.com/abir.hossain.nishan.2025",
      linkedin: "https://www.linkedin.com/in/abir-hossain-nishan-csca%E2%84%A2-60b3081a8/",
      contact: "#",
    },
    {
      name: "Sadman Hossain",
      designation: "Vice Chairperson",
      img: "/sadman.jpg",
      facebook: "https://www.facebook.com/sadmante11",
      linkedin: "https://www.linkedin.com/in/sadman-hossain-56a17728a/",
      contact: "#",
    },
    {
      name: "Member 3",
      designation: "Founder",
      img: "/hof/member2.jpg",
      facebook: "#",
      linkedin: "#",
      contact: "#",
    },
    {
      name: "Member 4",
      designation: "Founder",
      img: "/hof/member2.jpg",
      facebook: "#",
      linkedin: "#",
      contact: "#",
    },
  ],
};

export default function HallOfFame() {
  return (
    <section id="hof" className="dark:bg-black py-24 bg-gray-100 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <Link href="/hof" className="relative inline-block group mb-12">
          <h2 className="text-4xl font-bold transition-colors duration-500 group-hover:text-green-400 dark:text-white">
            {hofContent.title}
          </h2>
          <span
            aria-hidden
            className="absolute left-1/2 -bottom-1 h-[3px] w-0 bg-green-400 transition-all duration-500 group-hover:w-full group-hover:left-0"
          />
        </Link>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-12">
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
                <h3 className="text-xl font-semibold dark:text-white">{member.name}</h3>
                <p className="text-gray-500 text-sm mb-4 dark:text-gray-300">
                  {member.designation}
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href={member.facebook}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    aria-label="Facebook"
                  >
                    <FaFacebook size={20} />
                  </a>
                  <a
                    href={member.linkedin}
                    className="text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin size={20} />
                  </a>
                  <a
                    href={`tel:${member.contact}`}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    aria-label="Contact"
                  >
                    <FaPhoneAlt size={20} />
                  </a>
                </div>
              </div>
            </GlareHover>
          ))}
        </div>
      </div>
    </section>
  );
}