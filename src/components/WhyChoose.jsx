import React from 'react';

const features = [
  {
    id: 1,
    title: 'Free Shipping',
    description: 'On all orders over $50 with fast delivery.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14l1 7H4l1-7zM7 16a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: '24/7 Support',
    description: 'We’re here to help anytime, anywhere.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414a6 6 0 01-8.485 8.485l-1.414 1.414a9 9 0 0011.313-11.313z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 15h.01M12 12h.01" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Secure Payment',
    description: 'Your payment information is safe with us.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect width="20" height="14" x="2" y="5" rx="2" ry="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v2m0 4h.01" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Quality Products',
    description: 'We offer only the best brands and products.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7-5.5-4h7z" />
      </svg>
    ),
  },
];

const WhyChooseUs = () => {
  return (
    <section
      className="max-w-7xl mx-auto px-4 py-16"
      style={{
        background: 'rgba(10, 24, 61, 0.55)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1.5px solid rgba(255, 255, 255, 0.18)',
      }}
    >
      <h2 className="text-3xl font-bold mb-12 text-center text-white">Why Choose Us</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {features.map(({ id, title, description, icon }) => (
          <div
            key={id}
            className="flex flex-col items-center text-center p-6 rounded-xl transition transform hover:scale-105 hover:shadow-xl"
            style={{
              background: 'rgba(0, 123, 255, 0.15)', // Transparent blue
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: 'inset 0 0 10px rgba(0, 123, 255, 0.05)',
            }}
          >
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
            <p className="text-blue-100">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
