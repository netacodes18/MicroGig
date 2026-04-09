const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');
const Review = require('./models/Review');

dotenv.config();

const seedData = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // 2. Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    await Review.deleteMany();
    console.log('🗑️  Cleared existing data...');

    // 3. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
        bio: 'Full-stack developer passionate about building scalable web apps. 3+ years of experience with React, Node.js, and cloud services.',
        role: 'freelancer',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        rating: 4.9,
        reviewCount: 47,
        totalEarnings: 12450,
        completedGigs: 52,
        portfolio: { github: 'https://github.com/arjun', linkedin: 'https://linkedin.com/in/arjun', website: 'https://arjun.dev' }
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
        bio: 'UI/UX designer with a keen eye for detail. I create beautiful, user-centric interfaces that drive engagement and conversion.',
        role: 'freelancer',
        skills: ['Figma', 'UI/UX', 'Prototyping', 'Design Systems', 'Framer'],
        rating: 4.8,
        reviewCount: 38,
        totalEarnings: 9800,
        completedGigs: 41,
        portfolio: { linkedin: 'https://linkedin.com/in/priya', website: 'https://priya.design' }
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
        bio: 'Machine learning engineer specializing in NLP and computer vision. Published researcher with experience at top tech companies.',
        role: 'freelancer',
        skills: ['Python', 'TensorFlow', 'ML', 'NLP', 'Computer Vision'],
        rating: 4.7,
        reviewCount: 29,
        totalEarnings: 15200,
        completedGigs: 34,
        portfolio: { github: 'https://github.com/rahul', linkedin: 'https://linkedin.com/in/rahul' }
      },
      {
        name: 'Tech Ventures Inc.',
        email: 'hiring@techventures.com',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TV',
        bio: 'A leading tech startup incubator focused on building the next generation of SaaS tools.',
        role: 'client',
        rating: 5.0,
        reviewCount: 12
      },
      {
        name: 'Creative Agency',
        email: 'hello@creative.agency',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CA',
        bio: 'Full-service design agency helping brands scale with premium visual identities.',
        role: 'client',
        rating: 4.9,
        reviewCount: 25
      }
    ]);

    const arjun = users[0];
    const priya = users[1];
    const rahul = users[2];
    const techVentures = users[3];
    const creativeAgency = users[4];

    console.log('👤 Users created!');

    // 4. Create Jobs
    const jobs = await Job.insertMany([
      {
        title: 'Build a React Dashboard Component',
        description: 'We need a modern, responsive dashboard component built with React and TailwindCSS. The component should include charts, stat cards, and a recent activity feed.',
        category: 'Web Development',
        skills: ['React', 'TailwindCSS', 'TypeScript'],
        budget: { min: 50, max: 100, type: 'fixed' },
        duration: '4-6 hours',
        poster: techVentures._id,
        status: 'open',
        isUrgent: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Design a Mobile App Onboarding Flow',
        description: 'Looking for a talented UI/UX designer to create an engaging onboarding flow for our fitness app. Need 5-7 screens that guide new users through the app features.',
        category: 'Design',
        skills: ['Figma', 'UI/UX', 'Prototyping'],
        budget: { min: 80, max: 150, type: 'fixed' },
        duration: '1-2 days',
        poster: creativeAgency._id,
        status: 'open',
        isInstantHire: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Train a Sentiment Analysis Model',
        description: 'Need an ML engineer to train a sentiment analysis model on our customer review dataset. The model should classify reviews as positive, negative, or neutral.',
        category: 'Machine Learning',
        skills: ['Python', 'NLP', 'TensorFlow'],
        budget: { min: 120, max: 200, type: 'fixed' },
        duration: '1-2 days',
        poster: techVentures._id,
        status: 'open',
        createdAt: new Date()
      }
    ]);

    console.log('💼 Jobs created!');

    // 5. Create Reviews (acting as platform testimonials)
    await Review.insertMany([
      {
        reviewer: techVentures._id,
        reviewee: arjun._id,
        job: jobs[0]._id,
        rating: 5,
        comment: 'Arjun delivered outstanding results. His dashboard component was pixel perfect and optimized for performance. Highly recommend for any React work!'
      },
      {
        reviewer: creativeAgency._id,
        reviewee: priya._id,
        job: jobs[1]._id,
        rating: 5,
        comment: 'Priya is a design wizard. She understood our requirements immediately and delivered onboarding screens that were far beyond our expectations.'
      },
      {
        reviewer: techVentures._id,
        reviewee: rahul._id,
        job: jobs[2]._id,
        rating: 4,
        comment: 'Great work on the NLP model. Very responsive and technically sound. Looking forward to working together again.'
      }
    ]);

    console.log('🌟 Reviews created!');
    console.log('🚀 Seeding complete! Database is now dynamic.');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
