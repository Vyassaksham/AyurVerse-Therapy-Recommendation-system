import React from "react";

const PanchakarmSection = () => {
  return (
    <section className="panchakarma-section" id="about-ayurveda">
      <div className="container two-column-grid">
        <div className="left-column">
          <h2>Ayurvedic Therapy</h2>
          <p>
            Experience the ancient wisdom of Ayurveda through personalized therapeutic treatments designed to restore balance, rejuvenate your body, and enhance overall well-being. Our holistic approach addresses the root cause of health concerns while promoting natural healing.
          </p>
          <ul className="benefit-list">
            <li>
              <i className="fas fa-check-circle"></i> Deep Cellular Detox:
              Eliminates toxins at a cellular level, fostering profound
              cleansing.
            </li>
            <li>
              <i className="fas fa-check-circle"></i> Boosted Immunity:
              Strengthens your body's natural defense mechanisms against
              illness.
            </li>
            <li>
              <i className="fas fa-check-circle"></i> Enhanced Digestion:
              Rekindles metabolic fire (Agni) for improved nutrient absorption.
            </li>
            <li>
              <i className="fas fa-check-circle"></i> Mental Clarity & Calm:
              Reduces stress, anxiety, and promotes a serene mental state.
            </li>
            <li>
              <i className="fas fa-check-circle"></i> Balanced Hormones:
              Supports endocrine function, contributing to overall hormonal
              health.
            </li>
            <li>
              <i className="fas fa-check-circle"></i> Anti-Aging Effects:
              Rejuvenates tissues, promoting longevity and vitality.
            </li>
          </ul>
        </div>
        <div className="right-column">
          <h3>Five Essential Ayurvedic Therapies</h3>
          <div className="action-card">
            <img src="/1.png" alt="Vamana treatment" />
            <div className="card-content">
              <h4>
                 Abhyanga{" "}
                <span className="action-subtitle">(Therapeutic Oil Massage)</span>
              </h4>
              <p>
                A full-body massage using warm medicated oils tailored to your dosha type, promoting circulation, detoxification, and deep relaxation while nourishing the skin and calming the nervous system.
              </p>
            </div>
          </div>
          <div className="action-card">
            <img src="/2.png" alt="Virechana treatment" />
            <div className="card-content">
              <h4>
                Shirodhara  <span className="action-subtitle">(Third Eye Oil Therapy)</span>
              </h4>
              <p>
                A deeply meditative treatment where warm herbal oil flows continuously over the forehead, relieving stress, anxiety, insomnia, and mental fatigue while promoting mental clarity and emotional balance.
              </p>
            </div>
          </div>
          <div className="action-card">
            <img src="/3.png" alt="Basti treatment" />
            <div className="card-content">
              <h4>
                Kizhi  <span className="action-subtitle">(Herbal Bolus Therapy)</span>
              </h4>
              <p>
                Warm herbal poultices filled with medicinal herbs, powders, or rice are rhythmically applied to the body to reduce pain, inflammation, stiffness, and improve joint mobility.
              </p>
            </div>
          </div>
          <div className="action-card">
            <img src="/4.png" alt="Nasya treatment" />
            <div className="card-content">
              <h4>
                Swedana {" "}
                <span className="action-subtitle">(Herbal Steam Therapy)</span>
              </h4>
              <p>
                A therapeutic steam bath infused with Ayurvedic herbs that opens pores, eliminates toxins, improves circulation, and prepares the body for deeper cleansing treatments.
              </p>
            </div>
          </div>
          <div className="action-card">
            <img src="/5.png" alt="Raktamokshana treatment" />
            <div className="card-content">
              <h4>
                Udvartana{" "}
                <span className="action-subtitle">(Herbal Powder Massage)</span>
              </h4>
              <p>
                An invigorating dry or oil-based massage using herbal powders that exfoliates, reduces excess fat, improves skin texture, and stimulates lymphatic drainage for weight management and detoxification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PanchakarmSection;
