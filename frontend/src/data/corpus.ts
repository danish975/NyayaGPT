export type Chunk = {
  id: string;
  doc: string;
  act?: string;
  section: string;
  year?: number;
  state?: string;
  text: string;
  url?: string;
};

export const CORPUS: Chunk[] = [
  // ── Constitution of India ────────────────────────────────────────────
  {
    id: "art-14",
    doc: "Constitution of India",
    act: "Constitution of India",
    section: "Article 14 — Equality before law",
    year: 1950,
    text: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth.",
    url: "https://legislative.gov.in/constitution-of-india/",
  },
  {
    id: "art-19",
    doc: "Constitution of India",
    act: "Constitution of India",
    section: "Article 19 — Protection of certain rights regarding freedom of speech, etc.",
    year: 1950,
    text: "All citizens shall have the right to freedom of speech and expression; to assemble peaceably and without arms; to form associations or unions; to move freely throughout the territory of India; to reside and settle in any part of the territory of India; and to practise any profession, or to carry on any occupation, trade or business. Reasonable restrictions can be imposed in the interests of the sovereignty and integrity of India, the security of the State, friendly relations with foreign States, public order, decency or morality.",
    url: "https://legislative.gov.in/constitution-of-india/",
  },
  {
    id: "art-21",
    doc: "Constitution of India",
    act: "Constitution of India",
    section: "Article 21 — Protection of life and personal liberty",
    year: 1950,
    text: "No person shall be deprived of his life or personal liberty except according to procedure established by law. The Supreme Court has expanded Article 21 to include the right to live with dignity, right to livelihood, right to health, right to pollution-free environment, right to shelter, right to privacy, and right to education among other implied fundamental rights.",
    url: "https://legislative.gov.in/constitution-of-india/",
  },
  {
    id: "art-32",
    doc: "Constitution of India",
    act: "Constitution of India",
    section: "Article 32 — Remedies for enforcement of fundamental rights",
    year: 1950,
    text: "The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by Part III is guaranteed. The Supreme Court shall have power to issue directions or orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari, whichever may be appropriate, for the enforcement of any of the rights conferred by Part III.",
    url: "https://legislative.gov.in/constitution-of-india/",
  },
  {
    id: "art-368",
    doc: "Constitution of India",
    act: "Constitution of India",
    section: "Article 368 — Power of Parliament to amend the Constitution",
    year: 1950,
    text: "Notwithstanding anything in this Constitution, Parliament may in exercise of its constituent power amend by way of addition, variation or repeal any provision of this Constitution in accordance with the procedure laid down in this article. An amendment of this Constitution may be initiated only by the introduction of a Bill for the purpose in either House of Parliament, and when the Bill is passed in each House by a majority of the total membership of that House and by a majority of not less than two-thirds of the members of that House present and voting, it shall be presented to the President who shall give his assent to the Bill and thereupon the Constitution shall stand amended.",
    url: "https://legislative.gov.in/constitution-of-india/",
  },

  // ── RTI Act 2005 ────────────────────────────────────────────────────
  {
    id: "rti-s4",
    doc: "RTI Act 2005",
    act: "Right to Information Act 2005",
    section: "Section 4 — Obligations of public authorities",
    year: 2005,
    text: "Every public authority shall maintain all its records duly catalogued and indexed; publish within 120 days of enactment: the particulars of its organisation, functions and duties; the powers and duties of its officers and employees; the procedure followed in its decision-making process; the norms set for discharge of functions; the rules, regulations, instructions, manuals and records used by employees; a statement of categories of documents held; the particulars of any arrangement for consultation with or representation by members of the public; a directory of its officers and employees; the monthly remuneration received by its officers.",
    url: "https://rti.gov.in/",
  },
  {
    id: "rti-s6",
    doc: "RTI Act 2005",
    act: "Right to Information Act 2005",
    section: "Section 6 — Request for obtaining information",
    year: 2005,
    text: "A person who desires to obtain any information under this Act shall make a request in writing or through electronic means in English or Hindi or in the official language of the area, to the Central Public Information Officer or State Public Information Officer specifying the particulars of the information sought. An applicant making a request shall not be required to give any reason for requesting the information or any other personal details except those necessary for contacting him. Application fee prescribed: ₹10 for Central Government. BPL applicants are exempt from fee.",
    url: "https://rti.gov.in/",
  },
  {
    id: "rti-s7",
    doc: "RTI Act 2005",
    act: "Right to Information Act 2005",
    section: "Section 7 — Disposal of request",
    year: 2005,
    text: "Subject to the proviso to sub-section (2) of section 5 or the proviso to sub-section (3) of section 6, the Central or State Public Information Officer shall, as expeditiously as possible, and in any case within 30 days of the receipt of the request, either provide the information on payment of such fee as may be prescribed or reject the request for any of the reasons specified in sections 8 and 9. Where the information sought concerns the life or liberty of a person, the same shall be provided within 48 hours.",
    url: "https://rti.gov.in/",
  },
  {
    id: "rti-s8",
    doc: "RTI Act 2005",
    act: "Right to Information Act 2005",
    section: "Section 8 — Exemption from disclosure of information",
    year: 2005,
    text: "Notwithstanding anything contained in this Act, there shall be no obligation to give any citizen information which would prejudicially affect the sovereignty and integrity of India, the security, strategic, scientific or economic interests of the State, relation with foreign State or lead to incitement of an offence; information which has been expressly forbidden to be published by any court of law or tribunal or the disclosure of which may constitute contempt of court; information, the disclosure of which would cause a breach of privilege of Parliament or the State Legislature; information including commercial confidence, trade secrets or intellectual property.",
    url: "https://rti.gov.in/",
  },

  // ── DPDP Act 2023 ───────────────────────────────────────────────────
  {
    id: "dpdp-consent",
    doc: "DPDP Act 2023",
    act: "Digital Personal Data Protection Act 2023",
    section: "Section 6 — Consent",
    year: 2023,
    text: "The consent given by the Data Principal shall be free, specific, informed, unconditional and unambiguous with a clear affirmative action, and shall signify an agreement to the processing of her personal data for the specified purpose and may be withdrawn at any point of time. A Data Fiduciary must provide a notice before obtaining consent, including a description of personal data to be collected, the purpose of processing, and the manner in which the Data Principal may exercise her rights.",
    url: "https://www.meity.gov.in/data-protection-framework",
  },
  {
    id: "dpdp-rights",
    doc: "DPDP Act 2023",
    act: "Digital Personal Data Protection Act 2023",
    section: "Section 11 — Rights of the Data Principal",
    year: 2023,
    text: "Every Data Principal shall have the right to obtain from the Data Fiduciary: a summary of personal data being processed; the identities of all other Data Fiduciaries and Data Processors with whom the personal data has been shared; any other information related to the personal data and its processing as may be prescribed. The Data Principal has the right to correction, completion, updating and erasure of personal data for the purpose for which it was collected.",
    url: "https://www.meity.gov.in/data-protection-framework",
  },
  {
    id: "dpdp-children",
    doc: "DPDP Act 2023",
    act: "Digital Personal Data Protection Act 2023",
    section: "Section 9 — Processing of personal data of children",
    year: 2023,
    text: "Before processing any personal data of a child, a Data Fiduciary shall obtain verifiable consent of the parent or lawful guardian of such child. A Data Fiduciary shall not undertake tracking or behavioural monitoring of children or targeted advertising directed at children. The Data Fiduciary shall not undertake such processing of personal data that is likely to cause any detrimental effect on the well-being of a child.",
    url: "https://www.meity.gov.in/data-protection-framework",
  },
  {
    id: "dpdp-penalties",
    doc: "DPDP Act 2023",
    act: "Digital Personal Data Protection Act 2023",
    section: "Section 33 — Penalties",
    year: 2023,
    text: "Penalties include: up to ₹250 crore for failure to take reasonable security safeguards to prevent personal data breach; up to ₹200 crore for failure to give notice of personal data breach to the Board and each affected Data Principal; up to ₹150 crore for non-fulfilment of additional obligations in relation to children; and up to ₹50 crore for any other non-compliance.",
    url: "https://www.meity.gov.in/data-protection-framework",
  },

  // ── PMAY ─────────────────────────────────────────────────────────────
  {
    id: "pmay-elig",
    doc: "PMAY-U Guidelines",
    act: "Pradhan Mantri Awas Yojana (Urban)",
    section: "Eligibility Criteria — Income Slabs",
    year: 2015,
    text: "PMAY-U targets urban poor including EWS (Economically Weaker Section) with annual income up to ₹3 lakh, LIG (Low Income Group) with annual income between ₹3–6 lakh, MIG-I (Middle Income Group I) with annual income ₹6–12 lakh, and MIG-II with annual income ₹12–18 lakh. Under Credit Linked Subsidy Scheme (CLSS), the subsidy rates are: EWS/LIG — 6.5% interest subsidy on loan up to ₹6 lakh; MIG-I — 4% interest subsidy on loan up to ₹9 lakh; MIG-II — 3% interest subsidy on loan up to ₹12 lakh. Preference is given to women ownership especially under EWS and LIG categories.",
    url: "https://pmay-urban.gov.in/",
  },
  {
    id: "pmay-components",
    doc: "PMAY-U Guidelines",
    act: "Pradhan Mantri Awas Yojana (Urban)",
    section: "Components of PMAY-U",
    year: 2015,
    text: "PMAY-U has four verticals: (1) In-situ Slum Redevelopment using land as resource with private participation; (2) Credit Linked Subsidy Scheme (CLSS) for EWS/LIG/MIG categories; (3) Affordable Housing in Partnership with public and private sectors; (4) Beneficiary-Led Individual House Construction or Enhancement for EWS category. The mission period was 2015–2022, later extended. Central assistance ranges from ₹1 lakh to ₹2.5 lakh per house under different components.",
    url: "https://pmay-urban.gov.in/",
  },

  // ── MGNREGA ──────────────────────────────────────────────────────────
  {
    id: "nrega-100",
    doc: "MGNREGA Guidelines",
    act: "Mahatma Gandhi National Rural Employment Guarantee Act 2005",
    section: "Section 3 — Guarantee of 100 days employment",
    year: 2005,
    text: "Every State Government shall, in such rural area as may be notified by the Central Government, provide to every household whose adult members volunteer to do unskilled manual work not less than one hundred days of such work in a financial year. If an applicant is not provided employment within fifteen days of receipt of application or from the date on which employment has been sought, the applicant shall be entitled to a daily unemployment allowance. Wages shall be paid within fifteen days of the date on which work was done.",
    url: "https://nrega.nic.in/",
  },
  {
    id: "nrega-works",
    doc: "MGNREGA Guidelines",
    act: "Mahatma Gandhi National Rural Employment Guarantee Act 2005",
    section: "Schedule I — List of permissible works",
    year: 2005,
    text: "Permissible works under MGNREGA include: water conservation and water harvesting; drought proofing including afforestation and tree plantation; irrigation canals including micro and minor irrigation works; provision of irrigation facility to land owned by SC/ST/BPL/IAY beneficiaries; renovation of traditional water bodies; land development; flood control and protection works; rural connectivity including all-weather roads; and any other work which may be notified by the Central Government.",
    url: "https://nrega.nic.in/",
  },
  {
    id: "nrega-social-audit",
    doc: "MGNREGA Guidelines",
    act: "Mahatma Gandhi National Rural Employment Guarantee Act 2005",
    section: "Section 17 — Social audit of works",
    year: 2005,
    text: "The Gram Sabha shall conduct regular social audits of all the projects under the Scheme taken up within the Gram Panchayat. The Gram Panchayat shall make available all relevant documents including the muster rolls, bills, vouchers, measurement books, copies of sanction orders and other connected books of account and papers to the Gram Sabha for this purpose. Any person who is or has been employed in a scheme may participate in the social audit.",
    url: "https://nrega.nic.in/",
  },

  // ── NEP 2020 ─────────────────────────────────────────────────────────
  {
    id: "nep-structure",
    doc: "NEP 2020",
    act: "National Education Policy 2020",
    section: "School Education — New 5+3+3+4 Structure",
    year: 2020,
    text: "The curricular and pedagogical structure of school education will be restructured to make it responsive and relevant with a 5+3+3+4 design: Foundational Stage (age 3–8, 5 years) comprising 3 years of pre-primary plus Grades 1–2; Preparatory Stage (age 8–11, 3 years) comprising Grades 3–5; Middle Stage (age 11–14, 3 years) comprising Grades 6–8; and Secondary Stage (age 14–18, 4 years) comprising Grades 9–12. Mother tongue or local language shall be the medium of instruction until at least Grade 5, preferably till Grade 8.",
    url: "https://www.education.gov.in/nep/about-nep",
  },
  {
    id: "nep-higher-ed",
    doc: "NEP 2020",
    act: "National Education Policy 2020",
    section: "Higher Education — Multidisciplinary & Flexible",
    year: 2020,
    text: "All higher education institutions shall aim to become multidisciplinary by 2040. Undergraduate education will be 3 or 4-year programmes with multiple exit points: Certificate after 1 year, Diploma after 2 years, Bachelor's after 3 years, and Bachelor's with Research after 4 years. An Academic Bank of Credits (ABC) shall be established to facilitate Transfer of Credits. Affiliation system shall be phased out over 15 years with graded autonomy. All HEIs will be governed by a single regulator: the Higher Education Commission of India (HECI).",
    url: "https://www.education.gov.in/nep/about-nep",
  },
  {
    id: "nep-technology",
    doc: "NEP 2020",
    act: "National Education Policy 2020",
    section: "Technology Use and Integration",
    year: 2020,
    text: "A National Educational Technology Forum (NETF) will be created as a platform for the free exchange of ideas on the use of technology to enhance learning, assessment, planning, and administration. Technology will be extensively used for online and digital education to address issues of access and equity. The DIKSHA platform will be the nation's digital infrastructure for providing quality e-content. Virtual labs, AI-based tools, and smart classrooms will be encouraged.",
    url: "https://www.education.gov.in/nep/about-nep",
  },

  // ── Ayushman Bharat ──────────────────────────────────────────────────
  {
    id: "ayush-coverage",
    doc: "Ayushman Bharat PM-JAY",
    act: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
    section: "Coverage and Benefits",
    year: 2018,
    text: "Ayushman Bharat PM-JAY provides a health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalisation to over 12 crore poor and vulnerable families (approximately 55 crore beneficiaries). The scheme covers 3 days of pre-hospitalisation and 15 days of post-hospitalisation expenses including diagnostics and medicines. It provides cashless and paperless access at empanelled hospitals across India. The scheme covers over 1,929 medical/surgical packages including surgery, medical and day care treatments, cost of medicines, diagnostics and transport.",
    url: "https://pmjay.gov.in/",
  },
  {
    id: "ayush-eligibility",
    doc: "Ayushman Bharat PM-JAY",
    act: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
    section: "Eligibility Criteria",
    year: 2018,
    text: "Eligibility is based on deprivation and occupational criteria from the Socio-Economic Caste Census 2011 (SECC 2011). For rural areas, families with at least one of seven deprivation parameters (kutcha house, no adult member, female-headed household, SC/ST, no literate adult, landless, manual casual labour) are covered. For urban areas, 11 occupational categories including rag pickers, beggars, domestic workers, street vendors, construction workers, plumbers, and sweepers are eligible. No cap on family size and no restriction on age.",
    url: "https://pmjay.gov.in/",
  },
];
