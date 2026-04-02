
import './Journey.css';

const Journey = () => {
  return (
    <section className="journey">
      <div className="container">
        <div className="journey-card shadow-sm">
          <div className="journey-content">
            <h2>Your Journey to Wellness, Simplified.</h2>
            <p>We believe healthcare should be transparent. Track every step of your treatment plan with our intuitive health portal.</p>
            
            <ul className="journey-list">
              <li>
                <span className="material-icons check-icon">check_circle</span>
                <span>Real-time update on test results</span>
              </li>
              <li>
                <span className="material-icons check-icon">check_circle</span>
                <span>Direct secure messaging with physicians</span>
              </li>
              <li>
                <span className="material-icons check-icon">check_circle</span>
                <span>One-click prescription renewals</span>
              </li>
            </ul>
          </div>
          
          <div className="tracker-container">
            <div className="progress-steps">
              <div className="progress-line"></div>
              <div className="step completed">
                <span className="material-icons" style={{ fontSize: '14px' }}>check</span>
              </div>
              <div className="step completed">
                <span className="material-icons" style={{ fontSize: '14px' }}>check</span>
              </div>
              <div className="step active">
                <div className="step-dot"></div>
              </div>
              <div className="step">
                <div className="step-dot" style={{ backgroundColor: '#71787c', opacity: 0.3 }}></div>
              </div>
            </div>
            
            <div className="step-labels">
              <span>Intake</span>
              <span>Labs</span>
              <span className="active">Analysis</span>
              <span>Care Plan</span>
            </div>
            
            <div className="phase-card">
              <h5>Current Phase: Lab Analysis</h5>
              <p>Our specialists are reviewing your biometric data. Estimated completion: 24h.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
