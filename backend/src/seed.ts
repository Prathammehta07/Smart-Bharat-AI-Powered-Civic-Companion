import { getDb } from './db.js';

export async function seedDatabase() {
  const db = await getDb();

  // 1. Seed Citizen
  const citizenCount = await db.get('SELECT COUNT(*) as count FROM citizens');
  if (citizenCount.count === 0) {
    const profile = {
      age: 32,
      occupation: 'Farmer',
      annualIncome: 120000,
      state: 'Uttar Pradesh',
      familyCount: 4,
      isDifferentlyAbled: false
    };

    await db.run(
      `INSERT INTO citizens (id, name, email, phone, language_pref, profile_json) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'demo-citizen-123',
        'Rajesh Kumar',
        'rajesh.kumar@example.in',
        '+919876543210',
        'en',
        JSON.stringify(profile)
      ]
    );
    console.log('Seeded demo citizen.');
  }

  // 2. Seed Services
  const servicesCount = await db.get('SELECT COUNT(*) as count FROM services');
  if (servicesCount.count === 0) {
    const services = [
      {
        id: 'srv-aadhaar',
        title: 'Aadhaar Card Update & Enrollment',
        category: 'Identity Documents',
        description: 'Enroll for a new Aadhaar card or update demographics (name, address, DOB, gender, mobile, email) or biometrics at official UIDAI centers or online portal.',
        eligibility: ['All residents of India (including infants) are eligible for enrollment.', 'Updates require valid proof documents.'],
        documents: ['Proof of Identity (e.g. Passport, PAN Card, Voter ID)', 'Proof of Address (e.g. Electricity Bill, Bank Statement)', 'Proof of Date of Birth (e.g. Birth Certificate)'],
        steps: ['Book an appointment online via UIDAI portal or visit an Aadhaar Seva Kendra.', 'Fill out the enrollment/update form.', 'Submit documents and provide biometrics (fingerprints, iris scan, photograph).', 'Receive an acknowledgement slip with Enrolment ID (EID) to track status.'],
        portal_url: 'https://myaadhaar.uidai.gov.in/',
        avg_processing_days: 15
      },
      {
        id: 'srv-pan',
        title: 'Permanent Account Number (PAN) Card',
        category: 'Identity Documents',
        description: 'Application for allotment of a new Permanent Account Number (PAN) under section 139A of the Income Tax Act, or reprint/correction of PAN details.',
        eligibility: ['Any individual, business, or company requiring an Indian tax identification number.'],
        documents: ['Identity Proof (e.g. Aadhaar, Voter ID, Passport)', 'Address Proof (e.g. Utility Bill, Aadhaar, Driving License)', 'Date of Birth Proof (e.g. Matriculation Certificate, Birth Certificate)'],
        steps: ['Visit NSDL/UTIITSL official online portal.', 'Fill out Form 49A (for Indian Citizens) or Form 49AA (for Foreign Citizens).', 'Upload scanned documents and photograph/signature.', 'Pay the application fee online.', 'Authenticate via Aadhaar OTP (e-KYC) or post physical documents to NSDL.'],
        portal_url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
        avg_processing_days: 10
      },
      {
        id: 'srv-passport',
        title: 'Fresh Passport Application',
        category: 'Identity Documents',
        description: 'Apply for a fresh Indian Passport or reissue of an expired/damaged passport for international travel.',
        eligibility: ['Must be a citizen of India.', 'No criminal records under process.'],
        documents: ['Proof of Date of Birth (Birth Certificate, Transfer Certificate)', 'Proof of Present Address (Aadhaar, Water/Electricity Bill, Rent Agreement)', 'Non-ECR Category proof (Matriculation certificate, if applicable)'],
        steps: ['Register on the Passport Seva Online Portal.', 'Fill in the online application form.', 'Pay the fee and schedule an appointment at the nearest Passport Seva Kendra (PSK).', 'Visit the PSK with original documents for verification.', 'Police verification will be initiated at your address.', 'Passport is dispatched via speed post.'],
        portal_url: 'https://www.passportindia.gov.in/',
        avg_processing_days: 21
      },
      {
        id: 'srv-birth-cert',
        title: 'Birth Certificate Registration',
        category: 'Identity Documents',
        description: 'Register a birth and obtain a legal birth certificate. Births must be registered within 21 days of occurrence at the local municipal body or panchayat.',
        eligibility: ['Birth occurred within the jurisdiction of the issuing authority.'],
        documents: ['Hospital discharge summary/birth record', 'Aadhaar Card of parents', 'Proof of address where birth occurred', 'Affidavit if registering after 21 days'],
        steps: ['Obtain the birth reporting form from the hospital or local registrar office.', 'Fill in details of the child and parents.', 'Submit form along with hospital records to the local registrar (Municipal Corporation/Gram Panchayat).', 'Pay the nominal registration fee.', 'Collect the certificate after processing.'],
        portal_url: 'https://crsorgi.gov.in/',
        avg_processing_days: 7
      },
      {
        id: 'srv-ration-card',
        title: 'New Ration Card Application',
        category: 'Welfare Services',
        description: 'Apply for a new Ration Card (NFSA - APL/BPL/Antyodaya) for purchasing subsidized food grains from the Public Distribution System (PDS).',
        eligibility: ['Must be a resident of the applying state.', 'Must not hold an active ration card in any other state.', 'Income criteria based on BPL/NFSA state thresholds.'],
        documents: ['Aadhaar Card of all family members', 'Income Certificate', 'Proof of Address (LPG Connection Book, Electricity Bill)', 'Passport-sized photo of the Head of Family (usually female head)'],
        steps: ['Download or obtain the Ration Card Application form from Food & Civil Supplies Department.', 'Fill in details of all family members and assign head of family.', 'Submit form with documents to the local Circle Office/FS office.', 'Physical verification of the household will be done by an Inspector.', 'Ration card is issued post verification.'],
        portal_url: 'https://nfsa.gov.in/',
        avg_processing_days: 30
      },
      {
        id: 'srv-driving-license',
        title: 'Driving License (Learner & Permanent)',
        category: 'Employment & Transport',
        description: 'Apply for a Learner\'s License first, followed by a driving test to obtain a permanent driving license for light motor vehicles or two-wheelers.',
        eligibility: ['Age must be 16+ for gearless 2-wheelers up to 50cc; 18+ for geared vehicles/cars.', 'Must hold a Learner\'s License for at least 30 days before applying for permanent license.'],
        documents: ['Learner\'s License (for permanent DL)', 'Address Proof (Aadhaar, Passport)', 'Age Proof (Birth Certificate, School Leaving Certificate)', 'Medical Certificate Form 1A (for transport vehicles or age 40+)'],
        steps: ['Apply online on Sarathi Parivahan portal.', 'Upload documents and book slots for Learner\'s test (online or at RTO).', 'Pass the Learner\'s computer test and download Learner\'s license.', 'Practice driving for 30+ days.', 'Apply for Permanent DL, pay fee, and book driving test slot.', 'Pass the driving skill test at RTO to receive physical license.'],
        portal_url: 'https://sarathi.parivahan.gov.in/',
        avg_processing_days: 14
      },
      {
        id: 'srv-voter-id',
        title: 'Voter ID Card Registration (Form 6)',
        category: 'Identity Documents',
        description: 'Register as a general elector to get a Voter ID card (EPIC) and vote in elections.',
        eligibility: ['Must be an Indian citizen.', 'Must be 18 years or older on the qualifying date.', 'Must be a resident of the assembly constituency area.'],
        documents: ['Passport size photograph', 'Age Proof (Aadhaar, Birth Certificate, 10th marksheet)', 'Address Proof (Water/Electricity bill, bank passbook, Aadhaar)'],
        steps: ['Visit National Voters\' Service Portal (NVSP) or download Voter Helpline App.', 'Fill out Form 6 online.', 'Upload photograph, age proof, and address proof.', 'Booth Level Officer (BLO) will visit your address for verification.', 'EPIC is generated and sent via post, or digital e-EPIC can be downloaded.'],
        portal_url: 'https://voters.eci.gov.in/',
        avg_processing_days: 20
      },
      {
        id: 'srv-income-cert',
        title: 'Income Certificate Issuance',
        category: 'Welfare Services',
        description: 'Get an official certificate certifying the annual income of your family from all sources, used for claiming scholarships, fee concessions, and government schemes.',
        eligibility: ['Residents of the state requiring income verification.'],
        documents: ['Aadhaar Card', 'Salary Slip / IT Returns / Bank Statement', 'Affidavit declaring annual income', 'Land revenue details (for farmers)'],
        steps: ['Log in to your state\'s e-District portal.', 'Fill the online application and select the local circle/Tehsil.', 'Upload income proofs and signed affidavit.', 'Pay the processing fee.', 'Tehsildar/Revenue officer reviews and approves the digital certificate.'],
        portal_url: 'https://edistrict.gov.in/',
        avg_processing_days: 15
      },
      {
        id: 'srv-caste-cert',
        title: 'Caste Certificate (SC/ST/OBC)',
        category: 'Welfare Services',
        description: 'Official certificate verifying membership in Scheduled Caste, Scheduled Tribe, or Other Backward Classes for educational and job reservations.',
        eligibility: ['Belong to a recognized community listed in the Central or State caste lists.'],
        documents: ['Aadhaar Card', 'Caste certificate of father/relative', 'Land registry papers or old school records proving lineage', 'Residence proof of state for required number of years'],
        steps: ['Register on state e-District portal.', 'Fill the Caste Certificate Application form.', 'Upload proofs of lineage and identity.', 'Submit and pay fee.', 'Local revenue officer (Patwari/Lekhpal) verifies family history and issues certificate.'],
        portal_url: 'https://edistrict.gov.in/',
        avg_processing_days: 15
      },
      {
        id: 'srv-marriage-reg',
        title: 'Marriage Registration and Certificate',
        category: 'Identity Documents',
        description: 'Legally register a marriage under the Hindu Marriage Act, 1955 or Special Marriage Act, 1954 to get a Marriage Certificate.',
        eligibility: ['Groom age must be 21+ and Bride 18+.', 'Parties must have cohabited or solemnized marriage.'],
        documents: ['Proof of marriage (invitation card, temple receipt, photographs)', 'Identity and Address proof of both parties', 'Age proof of both parties', 'Two witnesses with Aadhaar cards'],
        steps: ['Apply on state e-District portal or Sub-Registrar Office portal.', 'Fill in details of bride, groom, and witnesses.', 'Schedule an appointment at the Sub-Registrar Office.', 'Visit the office with spouse, witnesses, and original documents.', 'Sign the register in front of the Registrar to receive certificate.'],
        portal_url: 'https://edistrict.gov.in/',
        avg_processing_days: 7
      },
      {
        id: 'srv-property-tax',
        title: 'Property Tax Payment & Assessment',
        category: 'Municipal Services',
        description: 'Assess property tax for residential or commercial properties and pay outstanding municipal property taxes online.',
        eligibility: ['Owner of property within municipal limits.'],
        documents: ['Previous property tax receipts', 'Property title/registry deed', 'Unique Property Identification Number (UPIN)'],
        steps: ['Visit local Municipal Corporation portal.', 'Search property using owner name, door number, or property ID.', 'Review tax calculation sheet based on area and category.', 'Pay via credit card, net banking, or UPI.', 'Download the official tax payment receipt.'],
        portal_url: 'https://www.india.gov.in/topics/municipalities',
        avg_processing_days: 1
      },
      {
        id: 'srv-panchayat-noc',
        title: 'Panchayat No Objection Certificate (NOC)',
        category: 'Municipal Services',
        description: 'Obtain No Objection Certificate from Gram Panchayat for commercial projects, house construction, electricity/water connections in rural areas.',
        eligibility: ['Resident or property owner in rural Panchayat limits.'],
        documents: ['Land ownership papers (Khasra/Khatauni)', 'Proposed building layout plan', 'Aadhaar Card', 'Tax clearance certificate from Panchayat'],
        steps: ['Write application to Sarpanch / Panchayat Secretary.', 'Submit land registry proofs.', 'Panchayat body discusses during meeting (Gram Sabha).', 'Panchayat issues signed NOC letter.'],
        portal_url: 'https://egramswaraj.gov.in/',
        avg_processing_days: 10
      },
      {
        id: 'srv-sc-scholarship',
        title: 'Post-Matric Scholarship Scheme',
        category: 'Welfare Services',
        description: 'Apply for post-matric scholarship for minority/SC/ST/OBC students studying in class 11, 12, graduation, post-graduation, or professional courses.',
        eligibility: ['Belong to SC/ST/OBC/Minority category.', 'Family annual income must be below Rs. 2.5 Lakhs.', 'Must have secured passing marks in previous final examination.'],
        documents: ['Caste Certificate', 'Income Certificate', 'Previous Class Marksheet', 'Fee receipt of current course', 'Bank passbook copy (Aadhaar linked)'],
        steps: ['Register on the National Scholarship Portal (NSP).', 'Fill in student profile and academic details.', 'Select the matching scholarship scheme.', 'Upload scanned copy of documents.', 'Submit application. Institute will verify, followed by State nodal officer.', 'Scholarship amount DBT directly to bank account.'],
        portal_url: 'https://scholarships.gov.in/',
        avg_processing_days: 45
      },
      {
        id: 'srv-ration-rationing',
        title: 'Subsidized Grain Distribution (FPS)',
        category: 'Welfare Services',
        description: 'Collect monthly allocated ration grains (Rice, Wheat, Sugar, Kerosene) from the designated Fair Price Shop (FPS) using biometric authentication.',
        eligibility: ['Holder of active Ration Card (NFSA/PHH/AAY).'],
        documents: ['Physical Ration Card (optional)', 'Aadhaar of any listed family member (for biometric authentication)'],
        steps: ['Locate local Fair Price Shop (Ration shop).', 'Verify shop is active and grains are in stock.', 'Authenticate biometric fingerprint on Point of Sale (ePOS) machine.', 'Pay subsidized rate (e.g. Rs. 2/kg wheat, Rs. 3/kg rice).', 'Collect grains and receive transaction SMS.'],
        portal_url: 'https://annavitran.nic.in/',
        avg_processing_days: 1
      },
      {
        id: 'srv-senior-citizen',
        title: 'Senior Citizen Certificate & Card',
        category: 'Welfare Services',
        description: 'Apply for a Senior Citizen identity card to claim benefits like concession in bus/train fares, bank interest bonuses, tax exemptions, and health care priority.',
        eligibility: ['Age must be 60 years or older.', 'Resident of the applying state.'],
        documents: ['Age proof (Voter ID, Passport, Birth certificate)', 'Address proof (Aadhaar card, Utility bill)', 'Passport-sized photo'],
        steps: ['Apply online on State e-District portal or local Social Welfare department.', 'Fill application form and upload documents.', 'Pay nominal fee (if any).', 'Identity card is generated online for download.'],
        portal_url: 'https://edistrict.gov.in/',
        avg_processing_days: 7
      }
    ];

    const stmt = await db.prepare(
      `INSERT INTO services (id, title, category, description, eligibility_json, documents_json, process_steps_json, portal_url, avg_processing_days) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const s of services) {
      await stmt.run([
        s.id,
        s.title,
        s.category,
        s.description,
        JSON.stringify(s.eligibility),
        JSON.stringify(s.documents),
        JSON.stringify(s.steps),
        s.portal_url,
        s.avg_processing_days
      ]);
    }
    await stmt.finalize();
    console.log('Seeded 15 government services.');
  }

  // 3. Seed Schemes
  const schemesCount = await db.get('SELECT COUNT(*) as count FROM schemes');
  if (schemesCount.count === 0) {
    const schemes = [
      {
        id: 'sch-pmay',
        title: 'Pradhan Mantri Awas Yojana (PMAY)',
        category: 'Housing & Urban Development',
        description: 'Welfare housing scheme which aims to provide affordable houses to all eligible urban and rural poor families by delivering pucca houses with basic amenities like water, sanitation, and electricity.',
        eligibility: {
          maxIncome: 1800000, // Up to 18 Lakhs for MIG
          minAge: 18,
          criteriaDescription: 'Families belonging to Economically Weaker Section (EWS), Low Income Group (LIG), or Middle Income Group (MIG). The beneficiary family should not own a pucca house in any part of India.'
        },
        benefits: 'Interest subsidy up to 6.5% on home loans (up to Rs. 2.67 Lakhs subsidy) or direct financial assistance of Rs. 1.2 Lakh to 1.3 Lakh for building a house in rural areas.',
        documents: ['Aadhaar card of all family members', 'Income certificate / Salary certificate', 'Affidavit stating family does not own a pucca house', 'Land registry papers (if constructing on owned plot)', 'Bank account details'],
        target_group: ['Rural Poor', 'Slum Dwellers', 'EWS', 'LIG', 'MIG', 'Women']
      },
      {
        id: 'sch-pmkisan',
        title: 'PM Kisan Samman Nidhi',
        category: 'Agriculture & Rural Development',
        description: 'An initiative by the Government of India that provides up to Rs. 6,000 per year in three equal installments directly into the bank accounts of small and marginal farmers.',
        eligibility: {
          maxIncome: null,
          minAge: 18,
          occupation: 'Farmer',
          criteriaDescription: 'Small and marginal landholding farmer families who own cultivable land in their names. Excludes institutional landholders, income tax payers, and retired pensioners drawing over Rs 10,000/month.'
        },
        benefits: 'Direct financial assistance of Rs. 6,000 per year, payable in three equal installments of Rs. 2,000 every four months.',
        documents: ['Land ownership papers (Khatauni / Patta)', 'Aadhaar Card (Mandatory)', 'Bank Passbook (Aadhaar linked)', 'Mobile number registered with Aadhaar'],
        target_group: ['Farmers', 'Landowners', 'Rural Residents']
      },
      {
        id: 'sch-ayushman',
        title: 'Ayushman Bharat PM-JAY',
        category: 'Health & Sanitation',
        description: 'The largest health assurance scheme in the world, providing cashless health insurance coverage for secondary and tertiary hospitalization to poor and vulnerable families.',
        eligibility: {
          maxIncome: 250000,
          minAge: null,
          criteriaDescription: 'Identified households based on SECC 2011 (Socio-Economic Caste Census) database, including rural households with specific deprivation criteria and occupational categories of urban workers (ragpickers, domestic workers, street vendors).'
        },
        benefits: 'Cashless cover of up to Rs. 5,000,000 per family per year for secondary and tertiary care hospitalization across impaneled public and private hospitals.',
        documents: ['Aadhaar Card', 'Ration Card', 'PM-JAY Letter / Golden Card (if issued)', 'Mobile number'],
        target_group: ['Below Poverty Line (BPL)', 'Low Income Families', 'Informal Workers', 'Rural Poor']
      },
      {
        id: 'sch-ujjwala',
        title: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
        category: 'Health & Sanitation',
        description: 'Launched by the Ministry of Petroleum and Natural Gas, this scheme provides deposit-free LPG connections to women from below-poverty-line households to replace unsafe cooking fuels.',
        eligibility: {
          maxIncome: 120000,
          minAge: 18,
          gender: 'Female',
          criteriaDescription: 'Adult woman belonging to any BPL household (including SC/ST, PMAY beneficiaries, Antyodaya Anna Yojana, Forest dwellers, Most Backward Classes) who does not have an active LPG connection in the household.'
        },
        benefits: 'Financial support of Rs. 1,600 for a new LPG connection, free first cylinder refill, and free hotplate (stove) along with loan facilities for subsequent refilling.',
        documents: ['BPL Ration Card', 'Aadhaar Card of applicant and adult family members', 'Bank account details (linked with Aadhaar)', 'BPL Certificate / Proof of category'],
        target_group: ['Women', 'BPL Households', 'Rural Women']
      },
      {
        id: 'sch-sukanya',
        title: 'Sukanya Samriddhi Yojana (SSY)',
        category: 'Education & Children',
        description: 'A small deposit savings scheme backed by the government, designed exclusively for the benefit of girl children under the "Beti Bachao Beti Padhao" campaign, offering high interest rates and tax exemptions.',
        eligibility: {
          maxIncome: null,
          minAge: 0,
          maxAge: 10,
          gender: 'Female',
          criteriaDescription: 'Can be opened by a parent or legal guardian in the name of a girl child from her birth till she attains the age of 10 years. Maximum of 2 accounts per family (except in case of twins/triplets).'
        },
        benefits: 'Attractive compounding interest rate (currently around 8.2% p.a.), tax savings under Section 80C, and lump sum payout for girl\'s higher education/marriage on maturity (after 21 years or age 18 marriage).',
        documents: ['Birth Certificate of the girl child', 'Aadhaar Card and PAN Card of the parent/guardian', 'Address proof of parent/guardian', 'Photograph of the child'],
        target_group: ['Girl Child', 'Parents', 'Middle Class', 'Lower Income']
      },
      {
        id: 'sch-mudra',
        title: 'Pradhan Mantri Mudra Yojana (PMMY)',
        category: 'Employment & Business',
        description: 'Provides collateral-free loans up to Rs. 10 Lakhs to non-corporate, non-farm small/micro enterprises to start or expand business activities (divided into Shishu, Kishor, and Tarun categories).',
        eligibility: {
          maxIncome: null,
          minAge: 18,
          criteriaDescription: 'Any Indian citizen who has a business plan for a non-farm sector income-generating activity such as manufacturing, processing, trading, or service sector, needing loans under Rs. 10 Lakhs.'
        },
        benefits: 'Collateral-free business loans: Shishu (up to Rs. 50,000), Kishor (Rs. 50,000 to Rs. 5 Lakhs), and Tarun (Rs. 5 Lakhs to Rs. 10 Lakhs) with flexible repayment terms.',
        documents: ['Business Idea proposal / Project Report', 'Identity and Address proofs of promoter', 'Business registration certificate / Licenses', 'Quotations of equipment/machinery to be purchased', 'Category certificate (SC/ST/OBC, if applicable)'],
        target_group: ['Entrepreneurs', 'Small Business Owners', 'Shopkeepers', 'Artisans', 'Youth']
      },
      {
        id: 'sch-atal-pension',
        title: 'Atal Pension Yojana (APY)',
        category: 'Employment & Business',
        description: 'A pension scheme focused on the unorganized sector workers, allowing them to save voluntarily for their retirement to secure a guaranteed monthly pension.',
        eligibility: {
          maxIncome: null,
          minAge: 18,
          maxAge: 40,
          criteriaDescription: 'All citizens of India between 18 and 40 years of age having a savings bank account. Must not be a member of any statutory social security scheme and not an income tax payer.'
        },
        benefits: 'Guaranteed minimum pension of Rs. 1,000, Rs. 2,000, Rs. 3,000, Rs. 4,000, or Rs. 5,000 per month after age 60, depending on the contributions made.',
        documents: ['Aadhaar Card', 'Mobile number', 'Savings Bank account details with auto-debit facility'],
        target_group: ['Unorganized Workers', 'Daily wage earners', 'Maids', 'Drivers', 'Self-employed']
      },
      {
        id: 'sch-pm-swanidhi',
        title: 'PM Street Vendor\'s AtmaNirbhar Nidhi (PM Swanidhi)',
        category: 'Employment & Business',
        description: 'A micro-credit facility scheme to provide working capital loans to street vendors to resume their livelihood post Covid-19 lockdowns.',
        eligibility: {
          maxIncome: null,
          minAge: 18,
          criteriaDescription: 'Street vendors and hawkers vending in urban, semi-urban, or rural areas who have certificate of vending or recommendation letter from local municipal body.'
        },
        benefits: 'Initial working capital loan of up to Rs. 10,000 (collateral-free), 7% interest subsidy on timely repayment, cashback on digital transactions up to Rs. 100/month, and eligibility for higher second loan (Rs. 20,000) and third loan (Rs. 50,000).',
        documents: ['Aadhaar Card', 'Certificate of Vending (CoV) / Vendor ID Card', 'Letter of Recommendation (LoR) from ULB', 'Bank account details'],
        target_group: ['Street Vendors', 'Hawkers', 'Urban Poor']
      },
      {
        id: 'sch-pm-kushal',
        title: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
        category: 'Education & Children',
        description: 'Skill certification scheme aiming to enable a large number of Indian youth to take up industry-relevant skill training that will help them secure a better livelihood.',
        eligibility: {
          maxIncome: null,
          minAge: 15,
          maxAge: 45,
          criteriaDescription: 'Unemployed youth or school/college dropouts looking for skill training and certification in specific job roles.'
        },
        benefits: 'Free industry-approved skill training, soft skills training, placement assistance, government recognized skill certification, and direct monetary reward upon passing assessment.',
        documents: ['Aadhaar Card', 'Educational Qualification marksheets (highest level completed)', 'Bank account details', 'Passport-sized photo'],
        target_group: ['Unemployed Youth', 'Dropouts', 'Skill Seekers']
      },
      {
        id: 'sch-pm-vishwakarma',
        title: 'PM Vishwakarma Scheme',
        category: 'Agriculture & Rural Development',
        description: 'Welfare scheme launched to support traditional artisans and craftspeople working with their hands and tools, providing them with training, toolkit incentive, and collateral-free credit.',
        eligibility: {
          maxIncome: null,
          minAge: 18,
          criteriaDescription: 'An artisan or craftsperson working with hands and tools in one of the 18 family-based traditional trades (e.g. Carpenter, Blacksmith, Potter, Weaver, Sculptor, Cobbler, Tailor). Only one member per family eligible.'
        },
        benefits: 'Biometric registration with PM Vishwakarma Certificate & Card, basic & advanced skill training, toolkit incentive of Rs. 15,000, collateral-free credit support up to Rs. 3 Lakhs at concessional interest rate of 5%.',
        documents: ['Aadhaar Card', 'Mobile number (Aadhaar linked)', 'Bank account details', 'Caste/Category certificate (if applicable)', 'Traditional trade declaration form'],
        target_group: ['Artisans', 'Craftspeople', 'Traditional Trades']
      }
    ];

    const stmt = await db.prepare(
      `INSERT INTO schemes (id, title, category, description, eligibility_json, benefits, documents_json, target_group_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const s of schemes) {
      await stmt.run([
        s.id,
        s.title,
        s.category,
        s.description,
        JSON.stringify(s.eligibility),
        s.benefits,
        JSON.stringify(s.documents),
        JSON.stringify(s.target_group)
      ]);
    }
    await stmt.finalize();
    console.log('Seeded 10 government schemes.');
  }

  // 4. Seed Complaints
  const complaintsCount = await db.get('SELECT COUNT(*) as count FROM complaints');
  if (complaintsCount.count === 0) {
    const today = new Date();
    const subDays = (d: number) => {
      const copy = new Date(today);
      copy.setDate(today.getDate() - d);
      return copy.toISOString();
    };

    const complaints = [
      {
        id: 'cmp-001',
        citizen_id: 'demo-citizen-123',
        category: 'roads',
        description: 'Large, dangerous pothole in the middle of Sector 4 main road near the government primary school, causing severe traffic jams and multiple minor bike accidents.',
        location_text: 'Sector 4 Main Road, near Primary School, Lucknow, UP',
        lat: 26.8467,
        lng: 80.9462,
        photo_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=400',
        status: 'Resolved',
        created_at: subDays(15),
        updated_at: subDays(2),
        timeline: [
          { status: 'Submitted', time: subDays(15), note: 'Complaint lodged successfully. Ticket CMP-001 generated.' },
          { status: 'Under Review', time: subDays(14), note: 'Assigned to Municipal Assistant Engineer, Zone 3.' },
          { status: 'In Progress', time: subDays(10), note: 'Road maintenance contractor scheduled repair work.' },
          { status: 'Resolved', time: subDays(2), note: 'Pothole filled with concrete mix. Photo upload verified.' }
        ]
      },
      {
        id: 'cmp-002',
        citizen_id: 'demo-citizen-123',
        category: 'sanitation',
        description: 'Overflowing municipal garbage container on the corner of 5th Cross Road. The trash has not been cleared for the last 5 days and is attracting stray dogs and flies.',
        location_text: '5th Cross Road, Indira Nagar, Lucknow, UP',
        lat: 26.8824,
        lng: 80.9678,
        photo_url: '',
        status: 'In Progress',
        created_at: subDays(4),
        updated_at: subDays(1),
        timeline: [
          { status: 'Submitted', time: subDays(4), note: 'Complaint submitted via Smart Bharat App.' },
          { status: 'Under Review', time: subDays(3), note: 'Reviewed by Sanitation Department Supervisor.' },
          { status: 'In Progress', time: subDays(1), note: 'Waste clearance truck dispatched, but driver reported access blocked by parked cars. Re-routing collection.' }
        ]
      },
      {
        id: 'cmp-003',
        citizen_id: 'demo-citizen-123',
        category: 'water',
        description: 'Leaking water main pipeline. Drinking water is spraying onto the street, wasting thousands of gallons of clean water. Flow has been continuous since this morning.',
        location_text: 'Opposite Central Park Gate 2, Lucknow, UP',
        lat: 26.8522,
        lng: 80.9499,
        photo_url: 'https://images.unsplash.com/photo-1542013936693-8848e574047a?q=80&w=400',
        status: 'Under Review',
        created_at: subDays(1),
        updated_at: subDays(1),
        timeline: [
          { status: 'Submitted', time: subDays(1), note: 'Emergency pipeline leakage reported.' },
          { status: 'Under Review', time: subDays(1), note: 'Assigned to Jal Sansthan water maintenance team.' }
        ]
      },
      {
        id: 'cmp-004',
        citizen_id: 'demo-citizen-123',
        category: 'electricity',
        description: 'Street light not working for a stretch of 200 meters. The street is pitch black after 7 PM, creating a major safety hazard for women and children returning home.',
        location_text: 'Railway Colony Road, Phase 2, Lucknow, UP',
        lat: 26.8398,
        lng: 80.9254,
        photo_url: '',
        status: 'Submitted',
        created_at: subDays(0.5),
        updated_at: subDays(0.5),
        timeline: [
          { status: 'Submitted', time: subDays(0.5), note: 'Complaint successfully received. Ticket generated.' }
        ]
      },
      {
        id: 'cmp-005',
        citizen_id: 'demo-citizen-123',
        category: 'public safety',
        description: 'Stray bulls fighting frequently on the busy weekly market street, endangering vendors, pedestrians, and causing shop damage. Animal control intervention needed.',
        location_text: 'Weekly Market Bazaar, Chowk, Lucknow, UP',
        lat: 26.8665,
        lng: 80.9123,
        photo_url: '',
        status: 'Resolved',
        created_at: subDays(10),
        updated_at: subDays(6),
        timeline: [
          { status: 'Submitted', time: subDays(10), note: 'Complaint submitted.' },
          { status: 'Under Review', time: subDays(9), note: 'Sent to Municipal Veterinary & Animal Welfare Department.' },
          { status: 'In Progress', time: subDays(8), note: 'Animal rescue vehicle sent to location for capture and relocation.' },
          { status: 'Resolved', time: subDays(6), note: 'Two stray bulls safely loaded and moved to cattle shelter in Mohanlalganj.' }
        ]
      },
      {
        id: 'cmp-006',
        citizen_id: 'demo-citizen-123',
        category: 'roads',
        description: 'Deep road cave-in on the service lane of Ring Road after the heavy rain yesterday. High risk of vehicle sinking.',
        location_text: 'Ring Road near Petrol Pump, Lucknow, UP',
        lat: 26.9021,
        lng: 80.9912,
        photo_url: '',
        status: 'In Progress',
        created_at: subDays(2),
        updated_at: subDays(1),
        timeline: [
          { status: 'Submitted', time: subDays(2), note: 'Cave-in reported.' },
          { status: 'Under Review', time: subDays(2), note: 'Site inspected by Assistant Engineer. Barricades placed around cave-in.' },
          { status: 'In Progress', time: subDays(1), note: 'Backfilling work has commenced.' }
        ]
      }
    ];

    const stmt = await db.prepare(
      `INSERT INTO complaints (id, citizen_id, category, description, location_text, lat, lng, photo_url, status, created_at, updated_at, timeline_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const c of complaints) {
      await stmt.run([
        c.id,
        c.citizen_id,
        c.category,
        c.description,
        c.location_text,
        c.lat,
        c.lng,
        c.photo_url,
        c.status,
        c.created_at,
        c.updated_at,
        JSON.stringify(c.timeline)
      ]);
    }
    await stmt.finalize();
    console.log('Seeded 6 complaints with timelines.');
  }

  // 5. Seed Knowledge Base (RAG chunks)
  const kbCount = await db.get('SELECT COUNT(*) as count FROM knowledge_base');
  if (kbCount.count === 0) {
    const services = await db.all('SELECT * FROM services');
    const schemes = await db.all('SELECT * FROM schemes');
    const chunks = [];

    // Chunks from Services
    for (const s of services) {
      const eligibility = JSON.parse(s.eligibility_json);
      const docs = JSON.parse(s.documents_json);
      const steps = JSON.parse(s.process_steps_json);
      
      const content = `Service Name: ${s.title}
Category: ${s.category}
Description: ${s.description}
Eligibility: ${eligibility.join(', ')}
Required Documents Check list: ${docs.join(', ')}
Application Process Steps: ${steps.join(' -> ')}
Official Portal Link: ${s.portal_url}
Estimated Processing Duration: ${s.avg_processing_days} days.`;

      const keywords = `${s.title} ${s.category} documents eligibility portal link how to apply process time verification`.toLowerCase().replace(/[^a-z0-9\s]/g, '');

      chunks.push({
        id: `kb-srv-${s.id}`,
        source_type: 'service',
        ref_id: s.id,
        content_chunk: content,
        keywords: keywords
      });
    }

    // Chunks from Schemes
    for (const s of schemes) {
      const el = JSON.parse(s.eligibility_json);
      const docs = JSON.parse(s.documents_json);
      const target = JSON.parse(s.target_group_json);

      const content = `Scheme Name: ${s.title}
Category: ${s.category}
Description: ${s.description}
Eligibility Rules: ${el.criteriaDescription || 'General'}
Income Limit: ${el.maxIncome ? 'Up to Rs. ' + el.maxIncome + ' p.a.' : 'No limit'}
Occupation Target: ${el.occupation || 'Any'}
Benefits: ${s.benefits}
Required Documents List: ${docs.join(', ')}
Target Group: ${target.join(', ')}`;

      const keywords = `${s.title} ${s.category} benefits apply eligibility rules income limit documents target group`.toLowerCase().replace(/[^a-z0-9\s]/g, '');

      chunks.push({
        id: `kb-sch-${s.id}`,
        source_type: 'scheme',
        ref_id: s.id,
        content_chunk: content,
        keywords: keywords
      });
    }

    const stmt = await db.prepare(
      `INSERT INTO knowledge_base (id, source_type, ref_id, content_chunk, keywords) 
       VALUES (?, ?, ?, ?, ?)`
    );

    for (const chunk of chunks) {
      await stmt.run([
        chunk.id,
        chunk.source_type,
        chunk.ref_id,
        chunk.content_chunk,
        chunk.keywords
      ]);
    }
    await stmt.finalize();
    console.log(`Seeded ${chunks.length} knowledge base chunks for RAG.`);
  }

  console.log('Database seeding completed successfully.');
}
