/**
 * Hardcoded surgical configuration for ConsentLens.
 * This ensures high-performance, legally vetted clinical content is always available
 * without requiring real-time LLM generation for standard procedures.
 */

export const SURGERY_CONFIGS = {
  appendix_lap: {
    name: "Laparoscopic Appendectomy",
    description: "Surgical removal of the appendix using minimally invasive keyhole techniques.",
    risks: [
      { id: "risk1", title: "Bleeding & Infection", description: "Standard surgical risks including internal hemorrhage or wound sepsis." },
      { id: "risk2", title: "Organ Injury", description: "Accidental trauma to the bowel, bladder, or major blood vessels." },
      { id: "risk3", title: "General Anesthesia", description: "Respiratory depression or allergic reactions to sedative agents." },
      { id: "risk4", title: "Conversion to Open", description: "Need to switch to a larger incision if complications arise." },
      { id: "risk5", title: "Shoulder Pain", description: "Referred pain caused by the CO2 gas used to inflate the abdomen." }
    ],
    benefits: "Prevents life-threatening rupture and peritonitis; shorter recovery time than open surgery.",
    preop: "Fast for 8 hours; inform staff of any blood thinners.",
    postop: "Avoid heavy lifting for 2 weeks; monitor for fever."
  },
  knee_replace: {
    name: "Total Knee Arthroplasty",
    description: "Replacing a damaged, worn, or diseased knee with an artificial joint.",
    risks: [
      { id: "risk1", title: "Blood Clots (DVT)", description: "Risk of clots in the legs that can travel to the lungs." },
      { id: "risk2", title: "Joint Stiffness", description: "Inability to regain full range of motion despite therapy." },
      { id: "risk3", title: "Implant Failure", description: "Loosening or wearing out of the artificial joint over 15-20 years." },
      { id: "risk4", title: "Nerve Damage", description: "Temporary or permanent numbness/weakness in the foot/leg." },
      { id: "risk5", title: "Persistent Pain", description: "Unexplained pain in the joint area after recovery." }
    ],
    benefits: "Significant reduction in chronic pain and restoration of mobile independence.",
    preop: "Dental clearance required to prevent infection; physical therapy prep.",
    postop: "Immediate weight-bearing as tolerated; strictly follow rehab exercises."
  },
  cataract: {
    name: "Phacoemulsification for Cataract",
    description: "Removing the cloudy natural lens and replacing it with an artificial intraocular lens.",
    risks: [
      { id: "risk1", title: "Retinal Detachment", description: "Potential tearing of the light-sensitive layer at the back of the eye." },
      { id: "risk2", title: "Posterior Capsular Opacity", description: "Secondary clouding often referred to as a 'secondary cataract'." },
      { id: "risk3", title: "Increased Eye Pressure", description: "Temporary spike in intraocular pressure (glaucoma risk)." },
      { id: "risk4", title: "Vitreous Loss", description: "Loss of the gel-like fluid inside the eye during surgery." },
      { id: "risk5", title: "Infection (Endophthalmitis)", description: "Serious internal eye infection that requires emergency treatment." }
    ],
    benefits: "Restoration of visual clarity, color perception, and night vision quality.",
    preop: "Antibiotic drops for 3 days; do not wear eye makeup on surgery day.",
    postop: "Wear eye shield at night; avoid bending or lifting heavy objects."
  }
};

/**
 * Helper to get config by surgery key OR fallback to a default
 */
export function getSurgeryConfig(id) {
  return SURGERY_CONFIGS[id] || SURGERY_CONFIGS['appendix_lap'];
}
