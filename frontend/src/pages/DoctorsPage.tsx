import React from 'react';
import './DoctorsPage.css';

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    specialty: "Cardiologist",
    image: "https://picsum.photos/seed/doc1/400/500",
    bio: "Specializing in restorative heart health with over 15 years of experience."
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    specialty: "Neurologist",
    image: "https://picsum.photos/seed/doc2/400/500",
    bio: "Expert in neurological recovery and cognitive wellness."
  },
  {
    id: 3,
    name: "Dr. Elena Rodriguez",
    specialty: "Pediatrician",
    image: "https://picsum.photos/seed/doc3/400/500",
    bio: "Dedicated to the gentle care and healthy growth of our youngest patients."
  },
  {
    id: 4,
    name: "Dr. Robert Chen",
    specialty: "Orthopedic Surgeon",
    image: "https://picsum.photos/seed/doc4/400/500",
    bio: "Focusing on mobility restoration and minimally invasive techniques."
  }
];

const DoctorsPage = () => {
  return (
    <div className="doctors-page">
      <div className="container">
        <div className="section-header">
          <h1>Find Your Doctor</h1>
          <p>Meet our team of dedicated specialists committed to your restorative journey.</p>
          <div className="header-line"></div>
        </div>
        
        <div className="doctors-grid">
          {doctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-image-wrapper">
                <img src={doctor.image} alt={doctor.name} className="doctor-image" referrerPolicy="no-referrer" />
              </div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <span className="specialty">{doctor.specialty}</span>
                <p>{doctor.bio}</p>
                <button className="btn-secondary">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
