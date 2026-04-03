import Image from 'next/image';
import { MdEmail } from 'react-icons/md';

type TeacherMessage = {
  id: number;
  name: string;
  photoDetails: {
    designation: string;
    department: string;
    institution: string;
    role: string;
  };
  messageAuthor: {
    name: string;
    title: string;
    organization: string;
  };
  email?: string;
  message: string;
  image: string;
  imageAlt: string;
  logo?: string;
};

const teacherMessages: TeacherMessage[] = [
  {
    id: 1,
    name: 'Dr. Mohammad Tajul Islam',
    photoDetails: {
      designation: 'Associate Professor',
      department: 'Department of Textile Engineering',
      institution: 'Ahsanullah University of Science and Technology (AUST)',
      role: 'Faculty Advisor – AATCC AUST Student Chapter',
    },
    messageAuthor: {
      name: 'Dr. Mohammad Tajul Islam',
      title: 'Founding Faculty Advisor',
      organization: 'AATCC AUST Student Chapter',
    },
    email: 'tajul@aust.edu',
    message:
      `The establishment of the AATCC AUST Student Chapter 
        marks an important step in strengthening student 
        engagement with the global textile community. 
        As the Founding Faculty Advisor, I am delighted 
        to support and mentor our students as they explore 
        innovation, sustainability, and professional 
        development in the textile field.
        Despite the many responsibilities of academic life, 
        I remain deeply enthusiastic about working with young
        and motivated students. Initiatives like this chapter
        create valuable opportunities for students to develop
        leadership skills, connect with industry and academia,
        and contribute to the advancement of the textile sector.
        I look forward to seeing our students grow through 
        collaboration, creativity, and responsible innovation.`,
    image: '/faculty.jpeg',
    imageAlt: 'Portrait of Prof. Omar Farrok',
    logo: '/logo.png',
  },
];

export default function TeacherMessages() {
  return (
    <section id="teacher-messages" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50 px-4 sm:px-6 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 md:mb-16 text-center dark:text-white">
          Messages from Teachers
        </h2>

        <div className="space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16">
          {teacherMessages.map((teacher, index) => (
            <article
              key={teacher.id}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-start"
            >
              {/* Photo - Left side, smaller */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative w-40 h-56 sm:w-48 sm:h-64 md:w-56 md:h-72 lg:w-64 lg:h-80 rounded-lg sm:rounded-xl overflow-hidden shadow-lg mb-4 sm:mb-6">
                  <Image
                    src={teacher.image}
                    alt={teacher.imageAlt}
                    fill
                    sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
                    className="object-cover object-top"
                    quality={90}
                    priority={index === 0}
                  />
                </div>
                {/* Details under photo */}
                <div className="text-center md:text-left w-full px-2 sm:px-0">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {teacher.name}
                  </h4>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-tight sm:leading-normal">
                      {teacher.photoDetails.designation}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight sm:leading-normal">
                      {teacher.photoDetails.department}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight sm:leading-normal">
                      {teacher.photoDetails.institution}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-tight sm:leading-normal">
                      {teacher.photoDetails.role}
                    </p>
                  </div>
                  {teacher.email && (
                    <a
                      href={`mailto:${teacher.email}`}
                      className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 transition-colors duration-200"
                    >
                      <MdEmail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 hover:scale-110 transition-transform duration-200" /> 
                      <span className="truncate">{teacher.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Message - Right side, spans 2 columns */}
              <div className="md:col-span-2 flex flex-col px-2 sm:px-0">
                {teacher.logo && (
                  <Image
                    src={teacher.logo}
                    alt="IDC logo"
                    width={56}
                    height={56}
                    className="mb-4 sm:mb-6 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                  />
                )}

                <p className="text-sm sm:text-base md:text-lg leading-7 sm:leading-8 text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
                  {teacher.message}
                </p>

                <div className="h-1 w-12 sm:w-16 bg-gray-800 dark:bg-gray-600 mb-4 sm:mb-6" />

                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {teacher.messageAuthor.name}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                    {teacher.messageAuthor.title}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {teacher.messageAuthor.organization}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
