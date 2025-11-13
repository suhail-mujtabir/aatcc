// app/about/page.tsx
'use client';

import TextReveal , {TextFadeIn} from '@/components/Textreveal';
const hero = {
    title: "About Us",
    subtitle:
      "Learn more about our journey, vision, and the people behind our student organization.",
    image: "/hero-textile.jpg", // Replace with your own image
  };
  
  const aboutIntro = {
    title: "Who We Are",
    text: `The AATCC AUST Student Chapter at Ahsanullah University of Science and
    Technology is dedicated to advancing the objects of the American Association
    of Textile Chemists and Colorists (AATCC). Our chapter operates under the
    governance of the AATCC Constitution and Bylaws, ensuring adherence to the
    highest standards of academic and professional excellence. Open to students
    in good standing—our chapter fosters a vibrant community of future leaders in
    textile science and color technology. Structured with elected officers, including
    a Chair, Vice Chair, Secretary, Treasurer and supported by a Faculty Advisor,
    the chapter is committed to both professional development and academic
    engagement.`,
    image: "/founding.jpg", // Replace with your own image
  };
  
  const journey = {
    title: "Our Journey",
    text: `Founded with the idea of bringing students together, the AATCC AUST 
    Student Chapter has grown from a small group of passionate innovators into a 
    thriving community. Along the way, we've hosted seminars, competitions, and 
    workshops that have helped our members gain both technical and leadership 
    skills, creating a legacy of growth and collaboration.`,
    image: "/founding.jpg", // Replace with your own image
  };
  
  const missionVision = {
    image: "/founding.jpg", // Replace with your own image
    mission: {
      title: "Our Mission",
      text: `The AATCC AUST Student Chapter is dedicated to advancing the
      core objectives of the AATCC by promoting critical thinking,
      practical learning, and effective communication among students.
      Through our initiatives, we empower members to bridge the gap
      between academic knowledge and industry practices, preparing
      them for successful careers in the textile sector.`,
    },
    vision: {
      title: "Our Vision",
      text: `To become the premier student chapter that inspires
      innovation and excellence in textile chemistry, color science,
      and quality control, thereby contributing to the global
      advancement of textile technology.`,
    },
  };
  
  // --- Page Component ---
  export default function AboutPage() {
    return (
      
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center text-center text-white">
          <div className="absolute inset-0">
            <img
              src={hero.image}
              alt={hero.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" /> {/* Overlay */}
          </div>
          <div className="relative z-10">
            
            <h1 className="text-5xl font-bold mb-4"><TextFadeIn>{hero.title}</TextFadeIn></h1>
           
            <p className="text-lg max-w-2xl mx-auto"><TextReveal duration={1} delay={0}>{hero.subtitle}</TextReveal></p>
          </div>
        </section>
  
        {/* Who We Are */}
        <section className="dark:bg-dark-panel py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
            <img
              src={aboutIntro.image}
              alt={aboutIntro.title}
              className="rounded-2xl shadow-lg"
            />
            <div>
              <h2 className="dark:text-white text-3xl font-bold mb-6"><TextFadeIn>{aboutIntro.title}</TextFadeIn></h2>
              <p className="dark:text-dark-muted text-lg text-gray-700 leading-relaxed">
                <TextReveal duration={2} delay={30}>{aboutIntro.text}</TextReveal>
              </p>
            </div>
          </div>
        </section>
  
        {/* Our Journey */}
        <section className="dark:bg-black py-20 ">
          <div className="dark:bg-black max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
            {/* Swap order for alternating layout */}
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6"><TextFadeIn>{journey.title}</TextFadeIn></h2>
              <p className="dark:text-dark-muted text-lg text-gray-700 leading-relaxed">
                <TextReveal duration={2} delay={30}>{journey.text}</TextReveal>
              </p>
            </div>
            <img
              src={journey.image}
              alt={journey.title}
              className="rounded-2xl shadow-lg order-1 md:order-2"
            />
          </div>
        </section>
  
        {/* Mission */}
        <section className="dark:bg-dark-panel py-20 bg-green-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
            <img
              src={missionVision.image}
              alt={missionVision.mission.title}
              className="rounded-2xl shadow-lg"
            />
            <div>
              <h2 className="text-3xl font-bold mb-6">
                <TextFadeIn>{missionVision.mission.title}</TextFadeIn>
              </h2>
              <p className="dark:text-dark-muted text-lg text-gray-700 leading-relaxed">
                <TextReveal duration={2} delay={30}>{missionVision.mission.text}</TextReveal>
              </p>
            </div>
          </div>
        </section>
  
        {/* Vision */}
        <section className="dark:bg-black py-20 bg-green-100">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {missionVision.vision.title}
              </h2>
              <p className="dark:text-dark-muted text-lg text-gray-700 leading-relaxed">
                <TextReveal duration={2} delay={30}>{missionVision.vision.text}</TextReveal>
              </p>
            </div>
            <img
              src={missionVision.image}
              alt={missionVision.vision.title}
              className="rounded-2xl shadow-lg"
            />
          </div>
        </section>
      </div>
    );
  }
  