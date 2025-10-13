"use client";

const newsContent = {
  title: "News & Announcements",
  items: [
    "📢 Registration open for upcoming hackathon!",
    "📢 New partnerships with tech companies.",
    "📢 Annual general meeting scheduled next month.",
  ],
};

export default function News() {
  return (
    <section id="news" className="py-24 bg-white text-center px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-8">{newsContent.title}</h2>
        <ul className="text-lg text-gray-700 space-y-4 text-left">
          {newsContent.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
