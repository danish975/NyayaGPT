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
    text: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.",
    url: "https://legislative.gov.in/constitution-of-india/",
  },
  {
    id: "art-15",
    doc: "Constitution of India",
    act: "Constitution of India",
    section: "Article 15 — Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth",
    year: 1950,
    text: "The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them. No citizen shall, on any of these grounds, be subject to any disability, liability, restriction or condition with regard to access to shops, public restaurants, hotels and places of public entertainment, or the use of wells, tanks, bathing ghats, roads and places of public resort maintained wholly or partly out of State funds or dedicated to the use of the general public. Clauses (3) to (6) allow the State to make special provisions for women and children, for socially and educationally backward classes, Scheduled Castes and Scheduled Tribes (including admission to educational institutions), and for economically weaker sections.",
    url: "https://legislative.gov.in/constitution-of-india/",
  },
  {
    id: "art-19",
    doc: "Constitution of India",
    act: "Constitution of India",
    section: "Article 19 — Protection of certain rights regarding freedom of speech, etc.",
    year: 1950,
    text: "All citizens shall have the right to freedom of speech and expression; to assemble peaceably and without arms; to form associations or unions or co-operative societies; to move freely throughout the territory of India; to reside and settle in any part of the territory of India; and to practise any profession, or to carry on any occupation, trade or business. Under Article 19(2), the State may impose reasonable restrictions on freedom of speech and expression in the interests of the sovereignty and integrity of India, the security of the State, friendly relations with foreign States, public order, decency or morality, or in relation to contempt of court, defamation or incitement to an offence. Clauses (3) to (6) set out the permitted grounds of restriction for the other freedoms.",
    url: "https://legislative.gov.in/constitution-of-india/",
  },
  {
    id: "art-21",
    doc: "Constitution of India",
    act: "Constitution of India",
    section: "Article 21 — Protection of life and personal liberty",
    year: 1950,
    text: "No person shall be deprived of his life or personal liberty except according to procedure established by law. The Supreme Court has expanded Article 21 to include the right to live with dignity, right to livelihood, right to health, right to pollution-free environment, right to shelter and right to privacy, among other implied fundamental rights. The right of children aged 6 to 14 to free and compulsory education is now an express fundamental right under Article 21A, inserted in 2002.",
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
    text: "Notwithstanding anything in this Constitution, Parliament may in exercise of its constituent power amend by way of addition, variation or repeal any provision of this Constitution in accordance with the procedure laid down in this article. An amendment of this Constitution may be initiated only by the introduction of a Bill for the purpose in either House of Parliament, and when the Bill is passed in each House by a majority of the total membership of that House and by a majority of not less than two-thirds of the members of that House present and voting, it shall be presented to the President who shall give his assent to the Bill and thereupon the Constitution shall stand amended. If the amendment seeks to change certain federal provisions (such as the election of the President, the extent of Union and State executive power, the Supreme Court and the High Courts, the distribution of legislative powers, the Lists in the Seventh Schedule, the representation of States in Parliament, or Article 368 itself), it must also be ratified by the Legislatures of not less than one-half of the States before it is presented to the President.",
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
    text: "A person who desires to obtain any information under this Act shall make a request in writing or through electronic means in English or Hindi or in the official language of the area, to the Central Public Information Officer or State Public Information Officer specifying the particulars of the information sought. An applicant making a request shall not be required to give any reason for requesting the information or any other personal details except those necessary for contacting him. The request must be accompanied by the prescribed fee: under the RTI Rules, 2012 the application fee for Central public authorities is ₹10 (State fees are set by State rules). Under Section 7(5), no fee is charged to persons below the poverty line.",
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
    section: "Sections 5–6 — Notice and consent",
    year: 2023,
    text: "Under Section 6, the consent given by the Data Principal shall be free, specific, informed, unconditional and unambiguous with a clear affirmative action, and shall signify an agreement to the processing of her personal data for the specified purpose, limited to such personal data as is necessary for that purpose. The Data Principal may withdraw consent at any time, with the same ease with which it was given. Under Section 5, every request for consent must be accompanied or preceded by a notice describing the personal data and the purpose of processing, how the Data Principal can withdraw consent and exercise her rights, and how she can complain to the Data Protection Board.",
    url: "https://www.meity.gov.in/data-protection-framework",
  },
  {
    id: "dpdp-rights",
    doc: "DPDP Act 2023",
    act: "Digital Personal Data Protection Act 2023",
    section: "Sections 11–12 — Right to access information; right to correction and erasure",
    year: 2023,
    text: "Every Data Principal shall have the right to obtain from the Data Fiduciary: a summary of personal data being processed; the identities of all other Data Fiduciaries and Data Processors with whom the personal data has been shared; any other information related to the personal data and its processing as may be prescribed. Under Section 12, the Data Principal has the right to correction, completion, updating and erasure of personal data processed with her consent.",
    url: "https://www.meity.gov.in/data-protection-framework",
  },
  {
    id: "dpdp-children",
    doc: "DPDP Act 2023",
    act: "Digital Personal Data Protection Act 2023",
    section: "Section 9 — Processing of personal data of children",
    year: 2023,
    text: "A child means an individual who has not completed eighteen years of age. Before processing any personal data of a child, a Data Fiduciary shall obtain verifiable consent of the parent or lawful guardian of such child. A Data Fiduciary shall not undertake tracking or behavioural monitoring of children or targeted advertising directed at children. The Data Fiduciary shall not undertake such processing of personal data that is likely to cause any detrimental effect on the well-being of a child.",
    url: "https://www.meity.gov.in/data-protection-framework",
  },
  {
    id: "dpdp-penalties",
    doc: "DPDP Act 2023",
    act: "Digital Personal Data Protection Act 2023",
    section: "Section 33 and Schedule — Penalties",
    year: 2023,
    text: "Under Section 33 read with the Schedule, the Data Protection Board may impose penalties of up to: ₹250 crore for failure to take reasonable security safeguards to prevent a personal data breach; ₹200 crore for failure to notify the Board and each affected Data Principal of a personal data breach; ₹200 crore for breach of the additional obligations relating to children; ₹150 crore for breach of the additional obligations of a Significant Data Fiduciary; ₹10,000 for breach of the duties of a Data Principal under Section 15; and ₹50 crore for any other breach of the Act or rules.",
    url: "https://www.meity.gov.in/data-protection-framework",
  },

  // ── PMAY ─────────────────────────────────────────────────────────────
  {
    id: "pmay2-elig",
    doc: "PMAY-U 2.0 Guidelines",
    act: "Pradhan Mantri Awas Yojana (Urban) 2.0",
    section: "Eligibility and Interest Subsidy Scheme",
    year: 2024,
    text: "PMAY-U 2.0, approved in 2024 for five years, aims to support 1 crore urban poor and middle-class families through four verticals: Beneficiary-Led Construction (BLC), Affordable Housing in Partnership (AHP), Affordable Rental Housing (ARH), and the Interest Subsidy Scheme (ISS). Eligible families are EWS (annual income up to ₹3 lakh), LIG (₹3–6 lakh) and MIG (₹6–9 lakh) households that do not own a pucca house anywhere in India. Under BLC and AHP, government assistance is ₹2.5 lakh per unit. Under ISS, for home loans up to ₹25 lakh on houses valued up to ₹35 lakh, a 4% interest subsidy is given on the first ₹8 lakh of the loan for a 12-year tenure, up to ₹1.8 lakh, released in five yearly instalments.",
    url: "https://pmay-urban.gov.in/",
  },
  {
    id: "pmay-elig",
    doc: "PMAY-U Guidelines",
    act: "Pradhan Mantri Awas Yojana (Urban)",
    section: "Eligibility Criteria — Income Slabs (2015 scheme, CLSS closed)",
    year: 2015,
    text: "Historical: the Credit Linked Subsidy Scheme (CLSS) closed to new loans on 31 March 2021 for MIG and 31 March 2022 for EWS/LIG; current applications fall under PMAY-U 2.0. PMAY-U targeted urban poor including EWS (Economically Weaker Section) with annual income up to ₹3 lakh, LIG (Low Income Group) with annual income between ₹3–6 lakh, MIG-I (Middle Income Group I) with annual income ₹6–12 lakh, and MIG-II with annual income ₹12–18 lakh. Under Credit Linked Subsidy Scheme (CLSS), the subsidy rates are: EWS/LIG — 6.5% interest subsidy on loan up to ₹6 lakh; MIG-I — 4% interest subsidy on loan up to ₹9 lakh; MIG-II — 3% interest subsidy on loan up to ₹12 lakh. Preference is given to women ownership especially under EWS and LIG categories.",
    url: "https://pmay-urban.gov.in/",
  },
  {
    id: "pmay-components",
    doc: "PMAY-U Guidelines",
    act: "Pradhan Mantri Awas Yojana (Urban)",
    section: "Components of PMAY-U",
    year: 2015,
    text: "PMAY-U has four verticals: (1) In-situ Slum Redevelopment using land as resource with private participation; (2) Credit Linked Subsidy Scheme (CLSS) for EWS/LIG/MIG categories; (3) Affordable Housing in Partnership with public and private sectors; (4) Beneficiary-Led Individual House Construction or Enhancement for EWS category. The mission period was 2015–2022, extended to 31 December 2024 to complete already-sanctioned houses (except CLSS). It has been succeeded by PMAY-U 2.0. Central assistance ranges from ₹1 lakh to ₹2.5 lakh per house under different components.",
    url: "https://pmay-urban.gov.in/",
  },

  // ── MGNREGA ──────────────────────────────────────────────────────────
  {
    id: "nrega-100",
    doc: "MGNREGA Guidelines",
    act: "Mahatma Gandhi National Rural Employment Guarantee Act 2005",
    section: "Sections 3 and 7 — Guarantee of 100 days employment; unemployment allowance",
    year: 2005,
    text: "Every State Government shall, in such rural area as may be notified by the Central Government, provide to every household whose adult members volunteer to do unskilled manual work not less than one hundred days of such work in a financial year. If an applicant is not provided employment within fifteen days of receipt of application or from the date on which employment has been sought, the applicant shall be entitled to a daily unemployment allowance. Wages shall be paid on a weekly basis and in any case not later than a fortnight after the date on which the work was done.",
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
    text: "The curricular and pedagogical structure of school education will be restructured to make it responsive and relevant with a 5+3+3+4 design: Foundational Stage (age 3–8, 5 years) comprising 3 years of pre-primary plus Grades 1–2; Preparatory Stage (age 8–11, 3 years) comprising Grades 3–5; Middle Stage (age 11–14, 3 years) comprising Grades 6–8; and Secondary Stage (age 14–18, 4 years) comprising Grades 9–12. Wherever possible, the medium of instruction until at least Grade 5, but preferably till Grade 8 and beyond, will be the home language, mother tongue, local language or regional language.",
    url: "https://www.education.gov.in/nep/about-nep",
  },
  {
    id: "nep-higher-ed",
    doc: "NEP 2020",
    act: "National Education Policy 2020",
    section: "Higher Education — Multidisciplinary & Flexible",
    year: 2020,
    text: "All higher education institutions shall aim to become multidisciplinary by 2040. Undergraduate education will be 3 or 4-year programmes with multiple exit points: Certificate after 1 year, Diploma after 2 years, Bachelor's after 3 years, and Bachelor's with Research after 4 years. An Academic Bank of Credits (ABC) shall be established to facilitate Transfer of Credits. Affiliation system shall be phased out over 15 years with graded autonomy. A single overarching umbrella body, the Higher Education Commission of India (HECI), will be set up for all higher education except medical and legal education.",
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
    text: "Ayushman Bharat PM-JAY provides a health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalisation to about 12 crore poor and vulnerable families (approximately 55 crore beneficiaries). Since October 2024, all senior citizens aged 70 and above are also eligible irrespective of income; families already covered get an additional ₹5 lakh top-up for members aged 70 and above. The scheme covers 3 days of pre-hospitalisation and 15 days of post-hospitalisation expenses including diagnostics and medicines. It provides cashless and paperless access at empanelled hospitals across India. The health benefit package covers nearly 2,000 procedures, including surgery, medical and day-care treatments, medicines and diagnostics.",
    url: "https://pmjay.gov.in/",
  },
  {
    id: "ayush-eligibility",
    doc: "Ayushman Bharat PM-JAY",
    act: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
    section: "Eligibility Criteria",
    year: 2018,
    text: "Eligibility is based on deprivation and occupational criteria from the Socio-Economic Caste Census 2011 (SECC 2011). In rural areas, households meeting any of the SECC deprivation criteria D1–D5 or D7 are covered: D1 only one room with kucha walls and roof; D2 no adult member aged 16–59; D3 female-headed household with no adult male aged 16–59; D4 a disabled member and no able-bodied adult; D5 SC/ST household; D7 landless household deriving a major part of its income from manual casual labour. Households without shelter, destitute households, manual scavenger families, primitive tribal groups and legally released bonded labourers are included automatically. In urban areas, 11 occupational categories are covered, including rag pickers, beggars, domestic workers, street vendors, construction workers, plumbers and sweepers. There is no cap on family size or age. Many States extend coverage further through their own schemes.",
    url: "https://pmjay.gov.in/",
  },
];
