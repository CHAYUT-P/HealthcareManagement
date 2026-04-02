
import './Services.css';

const services = [
  {
    title: 'Primary Care',
    description: 'Comprehensive health management and preventative care for all life stages.',
    icon: 'medical_services',
    color: '#bde9ff',
    iconColor: '#2f6378'
  },
  {
    title: 'Children',
    description: 'Dedicated pediatricians providing specialized care for your children\'s growth.',
    icon: 'child_care',
    color: '#bfedd6',
    iconColor: '#3d6655'
  },
  {
    title: 'Medical',
    description: 'Access top-tier medical consultations from the comfort of your own home.',
    icon: 'videocam',
    color: '#c6e9e7',
    iconColor: '#426362'
  },
  {
    title: 'Specialists',
    description: 'Expert diagnosis and treatment from our network of board-certified specialists.',
    icon: 'stethoscope',
    color: '#e0e3e4',
    iconColor: '#181c1d'
  }
];

const Services = () => {
  return (
    <section className="services">
      <div className="container">
        <div className="section-header">
          <h2>Our Services</h2>
          <div className="header-line"></div>
        </div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div 
                className="service-icon" 
                style={{ backgroundColor: service.color }}
              >
                <span 
                  className="material-icons" 
                  style={{ color: service.iconColor, fontSize: '2rem' }}
                >
                  {service.icon}
                </span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
