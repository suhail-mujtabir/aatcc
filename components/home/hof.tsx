
import Link from "next/link";
import { FaFacebook, FaLinkedin, FaPhoneAlt } from "react-icons/fa";

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
    <section id="hof" className="py-24 bg-gray-100 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <Link href="/hof" className="relative inline-block group mb-12">
          <h2 className="text-4xl font-bold transition-colors duration-500 group-hover:text-green-400">
            {hofContent.title}
          </h2>
          <span
            aria-hidden
            className="absolute left-1/2 -bottom-1 h-[3px] w-0 bg-green-400 transition-all duration-500 group-hover:w-full group-hover:left-0"
          />
        </Link>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-12">
          {hofContent.members.map((member, idx) => (
            <div
              key={idx}
              className="p-6 bg-white shadow-lg rounded-2xl hover:shadow-xl transition"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-green-200"
              />
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-gray-500 text-sm mb-4">
                {member.designation}
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href={member.facebook}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label="Facebook"
                >
                  <FaFacebook size={20} />
                </a>
                <a
                  href={member.linkedin}
                  className="text-blue-700 hover:text-blue-900"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={20} />
                </a>
                <a
                  href={`tel:${member.contact}`}
                  className="text-green-600 hover:text-green-800"
                  aria-label="Contact"
                >
                  <FaPhoneAlt size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
