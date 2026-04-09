'use client';

export default function ImpactStats() {
  const stats = [
    {
      number: '10,000+',
      label: 'Young People Reached',
    },
    {
      number: '500+',
      label: 'Mentors & Volunteers',
    },
    {
      number: '50+',
      label: 'Skills Programs',
    },
    {
      number: '$2.5M',
      label: 'Impact Generated',
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container">
        <h2 className="text-center mb-12">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
