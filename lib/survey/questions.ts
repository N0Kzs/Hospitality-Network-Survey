import { Section } from './types'

export const sections: Section[] = [
  {
    id: 's1',
    title: 'Company & Respondent',
    short: 'Company',
    questions: [
      { id: 'q1', type: 'text', prompt: 'Company / Hotel Group Name', required: true },
      { id: 'q2', type: 'text', prompt: 'Respondent Name', required: true },
      { id: 'q3', type: 'text', prompt: 'Position / Job Title', required: true },
      { id: 'q4', type: 'email', prompt: 'Email Address', required: true },
      {
        id: 'q5',
        type: 'single',
        prompt: 'Organization role',
        options: ['Hotel owner', 'Hotel operator / management company', 'Property developer', 'Real estate / property group', 'System integrator', 'Other']
      },
      {
        id: 'q6',
        type: 'single',
        prompt: 'Number of hospitality properties in the Philippines',
        options: ['1', '2–5', '6–10', '11–20', 'More than 20', 'Other']
      },
      {
        id: 'q7',
        type: 'multi',
        prompt: 'Property types',
        options: ['Luxury / 5-star hotels', 'Upscale hotels', 'Midscale hotels', 'Economy / budget hotels', 'Resorts', 'Serviced apartments', 'Condominiums / mixed-use developments', 'Other']
      }
    ]
  },
  {
    id: 's2',
    title: 'Current Network Infrastructure',
    short: 'Current Network',
    questions: [
      {
        id: 'q8',
        type: 'single',
        prompt: 'How would you describe your current network infrastructure?',
        options: ['Mostly new / recently upgraded', 'Relatively modern, but some areas require upgrades', 'Mixed — modern and legacy infrastructure', 'Mostly legacy infrastructure', 'Significant infrastructure upgrades are required', 'Not sure']
      },
      {
        id: 'q9',
        type: 'multi',
        prompt: 'What type of cabling infrastructure is predominantly used?',
        options: ['Copper Ethernet', 'Fiber optic', 'Combination of copper and fiber', 'Passive Optical LAN (POL)', 'Other', 'Not sure']
      },
      {
        id: 'q10',
        type: 'multi',
        prompt: 'Which network systems are currently deployed?',
        options: ['Traditional Ethernet LAN', 'Wi-Fi / WLAN', 'GPON / XGS-PON', 'Passive Optical LAN (POL)', 'IP CCTV', 'IP telephony', 'IPTV', 'Building Management System (BMS)', 'Access control', 'IoT / smart building systems', 'Other']
      },
      {
        id: 'q11',
        type: 'single',
        prompt: 'Approximately how old is the network infrastructure in your main properties?',
        options: ['Less than 3 years', '3–5 years', '5–10 years', 'More than 10 years', 'Different depending on the property', 'Not sure']
      },
      {
        id: 'q12',
        type: 'multi',
        prompt: 'What are the main challenges with your current network infrastructure?',
        options: ['Limited network capacity / bandwidth', 'Wi-Fi performance', 'Aging infrastructure', 'High power consumption', 'High maintenance requirements', 'High cabling density', 'Limited telecom room / rack space', 'Difficulty expanding the network', 'High CAPEX', 'High OPEX', 'Reliability / redundancy', 'Cybersecurity', 'Difficult integration with new technologies', 'Insufficient support / service', 'No major challenges currently', 'Other']
      }
    ]
  },
  {
    id: 's3',
    title: 'Investment Plans',
    short: 'Investment',
    questions: [
      {
        id: 'q13',
        type: 'single',
        prompt: 'Does your organization have plans to invest in network infrastructure in the Philippines?',
        options: ['Yes, investment is already approved', 'Yes, investment is planned but not yet approved', 'Investment is currently being evaluated', 'Possibly, but there are no specific plans yet', 'No investment currently planned', 'Not sure']
      }
    ]
  },
  {
    id: 's4',
    title: 'Active / Planned Investment',
    short: 'Active Investment',
    questions: [
      {
        id: 'q14',
        type: 'multi',
        prompt: 'What is driving the planned investment?',
        options: ['New hotel / resort development', 'Hotel renovation / refurbishment', 'Network modernization', 'Wi-Fi upgrade', 'Increased bandwidth requirements', 'Digital transformation', 'Smart hotel initiatives', 'Guest experience improvements', 'Replacement of aging infrastructure', 'Cybersecurity requirements', 'Energy efficiency / sustainability', 'Operational cost reduction', 'Expansion of IP-based systems', 'Corporate / brand standards', 'Other']
      },
      {
        id: 'q15',
        type: 'single',
        prompt: 'How many properties are currently being considered?',
        options: ['1', '2–3', '4–5', '6–10', 'More than 10', 'Not yet defined', 'Other']
      },
      {
        id: 'q16',
        type: 'multi',
        prompt: 'What type of project is involved?',
        options: ['Existing hotel renovation', 'Existing hotel network upgrade', 'New hotel construction', 'New resort construction', 'Mixed-use development', 'Serviced apartment development', 'Other']
      },
      {
        id: 'q17',
        type: 'single',
        prompt: 'When do you expect the network investment to take place?',
        options: ['Already in progress', 'Within the next 6 months', '6–12 months', '12–24 months', '2–3 years', 'More than 3 years', 'Not yet defined']
      },
      {
        id: 'q18',
        type: 'single',
        prompt: 'At what stage is the project currently?',
        options: ['Concept / initial planning', 'Feasibility study', 'Technology evaluation', 'Budgeting', 'Design', 'Tender / RFP preparation', 'Vendor selection', 'Procurement', 'Installation / deployment', 'Not yet started', 'Other']
      },
      {
        id: 'q19',
        type: 'single',
        prompt: 'What is the approximate budget allocated or expected for network infrastructure per property?',
        options: ['Less than PHP 1 million', 'PHP 1–3 million', 'PHP 3–5 million', 'PHP 5–10 million', 'PHP 10–25 million', 'More than PHP 25 million', 'Budget not yet defined', 'Prefer not to disclose']
      },
      {
        id: 'q20',
        type: 'multi',
        prompt: 'What areas are expected to be included?',
        options: ['Backbone network', 'Fiber optic infrastructure', 'Structured cabling', 'Switching', 'Wi-Fi', 'Passive Optical LAN', 'GPON / XGS-PON', 'Data center / server room', 'Telecom rooms', 'CCTV', 'IP telephony', 'IPTV', 'BMS', 'Access control', 'IoT / smart building', 'Network management', 'Cybersecurity', 'Other']
      }
    ]
  },
  {
    id: 's5',
    title: 'Future / Potential Investment',
    short: 'Potential Investment',
    questions: [
      {
        id: 'q21',
        type: 'single',
        prompt: 'Are you considering network infrastructure investments in the next 2–3 years?',
        options: ['Yes', 'Possibly', 'No', 'Not sure']
      },
      {
        id: 'q22',
        type: 'multi',
        prompt: 'What could potentially trigger a future investment?',
        options: ['Hotel renovation', 'New hotel development', 'Network modernization', 'Wi-Fi upgrade', 'Increasing bandwidth requirements', 'Aging infrastructure', 'Smart hotel initiatives', 'Sustainability / energy reduction', 'Cybersecurity', 'Expansion of property portfolio', 'Corporate / brand requirements', 'Other']
      },
      {
        id: 'q23',
        type: 'single',
        prompt: 'Approximately how many properties could potentially require investment?',
        options: ['1', '2–3', '4–5', '6–10', 'More than 10', 'Not yet defined', 'Other']
      },
      {
        id: 'q24',
        type: 'single',
        prompt: 'What would be the expected timeframe?',
        options: ['Within 12 months', '12–24 months', '2–3 years', 'More than 3 years', 'Not yet defined']
      }
    ]
  },
  {
    id: 's6',
    title: 'Technology & Architecture',
    short: 'Technology',
    questions: [
      {
        id: 'q25',
        type: 'multi',
        prompt: 'Which network architecture are you currently using or considering for future projects?',
        options: ['Traditional Ethernet LAN', 'Fiber-based LAN', 'Passive Optical LAN (POL)', 'GPON', 'XGS-PON', 'Combination of technologies', 'No technology selected yet', 'Other']
      },
      {
        id: 'q26',
        type: 'single',
        prompt: 'How interested would your organization be in evaluating Passive Optical LAN (POL) as an alternative to traditional Ethernet LAN?',
        options: ['Very interested', 'Interested and would like more information', 'Open to evaluating it', 'Prefer traditional Ethernet LAN', 'Not familiar with POL', 'Not relevant to our projects']
      },
      {
        id: 'q27',
        type: 'multi',
        prompt: 'Which benefits are most important when selecting a network architecture?',
        options: ['Lower CAPEX', 'Lower OPEX', 'Lower energy consumption', 'Reduced cabling', 'Reduced telecom room / rack space', 'Easier installation', 'Easier maintenance', 'Higher bandwidth', 'Scalability', 'Network reliability', 'Redundancy', 'Cybersecurity', 'Longer infrastructure lifetime', 'Simplified network management', 'Sustainability / ESG'],
        max: 5
      },
      {
        id: 'q28',
        type: 'multi',
        prompt: 'Are there any specific technology standards or brand requirements?',
        options: ['Hotel brand standards', 'Owner / developer standards', 'Hotel operator standards', 'Corporate IT standards', 'Consultant specifications', 'System integrator requirements', 'No specific requirements', 'Other']
      },
      {
        id: 'q29',
        type: 'multi',
        prompt: 'Which network equipment / technology vendors are currently used or preferred?',
        options: ['Cisco', 'HPE / Aruba', 'Huawei', 'Nokia', 'ZTE', 'Juniper', 'Extreme Networks', 'Ruckus', 'Other', 'No preference yet']
      },
      {
        id: 'q30',
        type: 'multi',
        prompt: 'Would you be interested in receiving technical support during the design/specification phase?',
        options: ['Network design', 'Architecture recommendation', 'Bill of Materials / BOM', 'Budgetary quotation', 'Technical specification', 'Value engineering', 'Proof of Concept', 'Installation support', 'Testing and certification', 'Training', 'After-sales support', 'Not currently required']
      }
    ]
  },
  {
    id: 's7',
    title: 'Decision & Procurement',
    short: 'Procurement',
    questions: [
      {
        id: 'q31',
        type: 'multi',
        prompt: 'Who is normally involved in selecting the network infrastructure solution?',
        options: ['Hotel owner', 'Property developer', 'Hotel operator', 'Corporate IT', 'Local IT team', 'Network consultant', 'MEP consultant', 'System integrator', 'General contractor', 'Procurement department', 'Other']
      },
      {
        id: 'q32',
        type: 'single',
        prompt: 'How are network infrastructure solutions normally purchased?',
        options: ['Directly from manufacturers', 'Through system integrators', 'Through distributors', 'Through electrical / MEP contractors', 'Through general contractors', 'Competitive tender / RFP', 'Other']
      },
      {
        id: 'q33',
        type: 'single',
        prompt: 'At what stage are network infrastructure vendors typically involved?',
        options: ['Concept / design stage', 'Specification stage', 'Budgeting stage', 'Tender stage', 'Vendor selection', 'Procurement', 'Installation', 'Only when problems occur', 'Other']
      },
      {
        id: 'q34',
        type: 'single',
        prompt: 'Do you normally require a consultant or system integrator to design/specify the network?',
        options: ['Yes', 'No', 'Depends on the project', 'Not sure']
      }
    ]
  },
  {
    id: 's8',
    title: 'Sustainability & Operational Priorities',
    short: 'Sustainability',
    questions: [
      {
        id: 'q35',
        type: 'single',
        prompt: 'How important are energy efficiency and sustainability when selecting network infrastructure?',
        options: ['Very important', 'Important', 'Moderately important', 'Low importance', 'Not a consideration']
      },
      {
        id: 'q36',
        type: 'multi',
        prompt: 'Are you currently looking for ways to reduce any of the following?',
        options: ['Energy consumption', 'Telecom room space', 'Rack space', 'Cable volume', 'Cooling requirements', 'Maintenance costs', 'Installation costs', 'Operational costs', 'None of the above']
      }
    ]
  },
  {
    id: 's9',
    title: 'Upcoming Projects',
    short: 'Projects',
    questions: [
      {
        id: 'q37',
        type: 'single',
        prompt: 'Are there any upcoming hotel or hospitality projects in the Philippines that may require new network infrastructure?',
        options: ['Yes', 'Possibly', 'No', 'Not sure']
      },
      {
        id: 'q38',
        type: 'single',
        prompt: 'Approximately how many projects are currently planned?',
        options: ['1', '2–3', '4–5', 'More than 5', 'Not yet defined', 'Other']
      },
      {
        id: 'q39',
        type: 'multi',
        prompt: 'What is the expected timeframe for these projects?',
        options: ['Within 12 months', '12–24 months', '2–3 years', 'More than 3 years', 'Not yet defined']
      },
      {
        id: 'q40',
        type: 'textarea',
        prompt: 'Please provide any additional information about upcoming projects that may be relevant to network infrastructure.'
      }
    ]
  },
  {
    id: 's10',
    title: 'Follow-Up',
    short: 'Follow-Up',
    questions: [
      {
        id: 'q41',
        type: 'single',
        prompt: 'Would you be interested in discussing your upcoming network infrastructure projects with our team?',
        options: ['Yes, please contact me', 'Yes, but at a later stage', 'I would first like to receive more information', 'No, not at this time']
      },
      {
        id: 'q42',
        type: 'multi',
        prompt: 'What would you be most interested in discussing?',
        options: ['Structured cabling', 'Fiber optic infrastructure', 'Passive Optical LAN (POL)', 'GPON / XGS-PON', 'Data center infrastructure', 'Network architecture', 'Network modernization', 'Cost optimization', 'Sustainability / energy efficiency', 'Design and engineering support', 'Other']
      },
      {
        id: 'q43',
        type: 'textarea',
        prompt: 'Additional comments or questions'
      }
    ]
  }
]
