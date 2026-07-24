import mongoose from 'mongoose';

const departmentHomeSchema = new mongoose.Schema(
  {
    departmentCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      enum: ['AI & DS', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL']
    },
    departmentName: {
      type: String,
      required: true
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80'
    },
    logoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80'
    },
    aboutText: {
      type: String,
      default: 'Welcome to the Department of Engineering. Our department is committed to producing world-class engineers equipped with analytical rigor, technical competence, and high moral ethics under Anna University regulations.'
    },
    vision: {
      type: String,
      default: 'To emerge as a center of excellence in engineering education and research, fostering innovative engineers and entrepreneurs for societal development.'
    },
    mission: {
      type: [String],
      default: [
        'M1: Provide state-of-the-art laboratory infrastructure and quality teaching-learning processes.',
        'M2: Establish strong industry-institute interaction for collaborative research and placement opportunities.',
        'M3: Instill ethical values, leadership qualities, and lifelong learning attitudes in students.'
      ]
    },
    peos: {
      type: [String],
      default: [
        'PEO1: Graduates will excel in professional engineering careers or higher learning.',
        'PEO2: Graduates will design and deploy innovative technical solutions to real-world challenges.',
        'PEO3: Graduates will demonstrate professional leadership, ethical conduct, and multidisciplinary teamwork.'
      ]
    },
    pos: {
      type: [String],
      default: [
        'PO1: Engineering Knowledge - Apply mathematics, science, and engineering fundamentals.',
        'PO2: Problem Analysis - Identify, formulate, and analyze complex engineering problems.',
        'PO3: Design/Development of Solutions - Design system components or processes meeting specified needs.'
      ]
    },
    psos: {
      type: [String],
      default: [
        'PSO1: Ability to apply domain-specific software tools and technical methodologies.',
        'PSO2: Capability to develop modern engineering applications meeting Anna University standards.'
      ]
    },
    hodName: {
      type: String,
      default: 'Dr. M. Sundaram, Ph.D.'
    },
    hodMessage: {
      type: String,
      default: 'Welcome to our department. We aim for academic rigor, hands-on industrial projects, and 100% placement support for every student.'
    },
    hodPhotoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'
    },
    achievements: {
      type: [String],
      default: [
        '100% Pass Percentage in Anna University Semester Examinations 2025.',
        '5 Student Startup Projects Funded by EDII Tamil Nadu.',
        'National Level Hackathon 1st Prize Winner.'
      ]
    },
    placements: {
      type: Array,
      default: [
        { company: 'TCS Digital', count: 18, package: '7.5 LPA' },
        { company: 'Zoho Corporation', count: 12, package: '8.4 LPA' },
        { company: 'Infosys Power Programmer', count: 15, package: '9.0 LPA' }
      ]
    },
    laboratories: {
      type: Array,
      default: [
        { name: 'Advanced Computing & AI Lab', equipment: '30 GPU Workstations, Intel i9 Systems' },
        { name: 'VLSI & Embedded Systems Lab', equipment: 'Cadence Design Suite, FPGA Trainer Kits' }
      ]
    },
    notices: {
      type: Array,
      default: [
        { title: 'Anna University End-Semester Timetable Released', date: '2026-07-20' },
        { title: 'Campus Placement Drive by Zoho on August 5th', date: '2026-07-22' }
      ]
    },
    contactEmail: {
      type: String,
      default: 'hod@jpcollege.edu'
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210'
    }
  },
  { timestamps: true }
);

export default mongoose.models.DepartmentHome || mongoose.model('DepartmentHome', departmentHomeSchema);
