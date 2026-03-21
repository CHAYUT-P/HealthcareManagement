import React from 'react';
import Services from '../components/Services';

const ServicesPage = () => {
  return (
    <div className="services-page" style={{ paddingTop: '80px' }}>
      <div className="container" style={{ padding: '4rem 2rem' }}>
        <div className="section-header">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Our Specialized Services</h1>
          <p style={{ color: 'var(--on-surface-variant)', maxWidth: '600px', marginBottom: '2rem' }}>
            We provide a wide range of medical services designed to restore your health and well-being with a gentle, patient-centered approach.
          </p>
          <div className="header-line"></div>
        </div>
      </div>
      <Services />
    </div>
  );
};

export default ServicesPage;
