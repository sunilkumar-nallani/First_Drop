import { PrismaClient, ReactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// =============================================================================
// FirstDrop Database Seed
// =============================================================================
// This script seeds the database with realistic mock data for development
// and testing purposes.
//
// Run with: npm run db:seed
// Or: npx tsx prisma/seed.ts
// =============================================================================

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...');
  await prisma.waitlistEntry.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.user.deleteMany();

  // =============================================================================
  // Create Users
  // =============================================================================
  console.log('👤 Creating users...');

  // User 1: Founder only - Sarah Chen (SaaS founder)
  const founderOnlyPassword = await bcrypt.hash('password123', 12);
  const founderOnly = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@techstart.io',
      passwordHash: founderOnlyPassword,
      isFounder: true,
      isUser: false,
      about: 'Serial entrepreneur building the future of remote work. Previously @Stripe @Notion.',
      profilePhoto: null,
      socialHandles: {
        twitter: '@sarahchentech',
        linkedin: 'sarahchen',
        website: 'https://sarahchen.io',
      },
    },
  });
  console.log(`  ✓ Created founder: ${founderOnly.name} (${founderOnly.email})`);

  // User 2: User only - Alex Martinez (early adopter)
  const userOnlyPassword = await bcrypt.hash('password123', 12);
  const userOnly = await prisma.user.create({
    data: {
      name: 'Alex Martinez',
      email: 'alex@producthunt.com',
      passwordHash: userOnlyPassword,
      isFounder: false,
      isUser: true,
      about: 'Product enthusiast. Early user of 100+ startups. Love discovering new ideas!',
      profilePhoto: null,
      socialHandles: {
        twitter: '@alexmart',
        linkedin: 'alexmartinez',
      },
    },
  });
  console.log(`  ✓ Created user: ${userOnly.name} (${userOnly.email})`);

  // User 3: Dual role - Jordan Park (founder AND user)
  const dualRolePassword = await bcrypt.hash('password123', 12);
  const dualRole = await prisma.user.create({
    data: {
      name: 'Jordan Park',
      email: 'jordan@innovate.co',
      passwordHash: dualRolePassword,
      isFounder: true,
      isUser: true,
      about: 'Building AI tools for creators. Also love testing new products and giving feedback.',
      profilePhoto: null,
      socialHandles: {
        twitter: '@jordanpark',
        linkedin: 'jordanpark',
        github: 'jordanpark',
      },
    },
  });
  console.log(`  ✓ Created dual-role user: ${dualRole.name} (${dualRole.email})`);

  // =============================================================================
  // Create Ideas
  // =============================================================================
  console.log('💡 Creating ideas...');

  // Idea 1: Sarah's AI Meeting Assistant
  const idea1 = await prisma.idea.create({
    data: {
      title: 'SyncAI - Intelligent Meeting Assistant',
      slug: 'syncai-meeting-assistant',
      sector: 'Artificial Intelligence',
      subSector: 'Productivity Tools',
      ideaDescription:
        'SyncAI automatically joins your meetings, takes notes, extracts action items, and generates follow-up emails. It learns your writing style and integrates with Slack, Notion, and your calendar. Unlike existing tools, SyncAI understands context and can answer questions about past meetings.',
      moat:
        'Our proprietary NLP model is trained specifically on meeting transcripts, giving us 40% better accuracy than generic models. We also have pending patents on contextual memory across meetings.',
      usp:
        'The only meeting assistant that connects insights across multiple meetings and automatically prepares briefings before each call based on your history with attendees.',
      marketSize: '$12B (Meeting Intelligence Market 2025)',
      ask: 'Looking for 50 beta users to test our product and provide feedback.',
      isFirstTimeFounder: false,
      mediaUrls: ['https://example.com/syncai-demo.mp4'],
      companyInfo:
        'Founded in 2024. Team of 3 ex-Googlers. Bootstrapped with $50k revenue from early pilots.',
      contactInfo: 'sarah@techstart.io',
      founderId: founderOnly.id,
    },
  });
  console.log(`  ✓ Created idea: ${idea1.title}`);

  // Idea 2: Sarah's Second Idea - Remote Team Culture Platform
  const idea2 = await prisma.idea.create({
    data: {
      title: 'CulturePulse - Remote Team Culture Platform',
      slug: 'culturepulse-remote-culture',
      sector: 'HR Tech',
      subSector: 'Employee Engagement',
      ideaDescription:
        'CulturePulse helps remote teams build strong culture through virtual water coolers, recognition systems, and culture analytics. We identify early warning signs of burnout and disengagement before they become problems.',
      moat:
        'We combine qualitative sentiment analysis with quantitative engagement metrics. Our culture score algorithm is based on research from 500+ remote companies.',
      usp:
        'The first platform that measures culture health in real-time and provides actionable recommendations, not just surveys.',
      marketSize: '$8B (Employee Engagement Software)',
      ask: 'Seeking design partners to help shape the product roadmap.',
      isFirstTimeFounder: false,
      mediaUrls: [],
      companyInfo: 'Pre-launch. MVP in development.',
      contactInfo: 'sarah@techstart.io',
      founderId: founderOnly.id,
    },
  });
  console.log(`  ✓ Created idea: ${idea2.title}`);

  // Idea 3: Jordan's Creator Tool
  const idea3 = await prisma.idea.create({
    data: {
      title: 'ContentForge - AI Content Studio for Creators',
      slug: 'contentforge-ai-studio',
      sector: 'Creator Economy',
      subSector: 'Content Creation Tools',
      ideaDescription:
        'ContentForge helps YouTubers, podcasters, and writers repurpose long-form content into social media posts, clips, and newsletters. Upload a video, get 20+ pieces of content optimized for each platform.',
      moat:
        'Our AI understands content context and brand voice. We maintain continuity across all repurposed content so it feels authentic, not robotic.',
      usp:
        'One-click content repurposing that maintains your unique voice across all platforms. Save 10+ hours per week.',
      marketSize: '$25B (Creator Economy Tools)',
      ask: 'Looking for content creators to join our waitlist.',
      isFirstTimeFounder: true,
      mediaUrls: ['https://example.com/contentforge-preview.png'],
      companyInfo: 'Solo founder. Former content strategist at HubSpot.',
      contactInfo: 'jordan@innovate.co',
      founderId: dualRole.id,
    },
  });
  console.log(`  ✓ Created idea: ${idea3.title}`);

  // Idea 4: Jordan's Second Idea - Newsletter Discovery
  const idea4 = await prisma.idea.create({
    data: {
      title: 'NewsletterHub - Discover Curated Newsletters',
      slug: 'newsletterhub-discovery',
      sector: 'Media',
      subSector: 'Newsletter Platform',
      ideaDescription:
        'NewsletterHub is like Product Hunt for newsletters. Discover, rate, and subscribe to the best newsletters across any topic. Authors get exposure; readers find quality content without inbox overwhelm.',
      moat:
        'Community-driven curation with a reputation system. Only subscribers can rate, preventing gaming.',
      usp:
        'The only platform where real subscribers validate newsletter quality, not just follower counts.',
      marketSize: '$5B (Newsletter Market)',
      ask: 'Newsletter authors: List your newsletter. Readers: Join to discover gems.',
      isFirstTimeFounder: true,
      mediaUrls: [],
      companyInfo: 'Side project. Weekend MVP built.',
      contactInfo: 'jordan@innovate.co',
      founderId: dualRole.id,
    },
  });
  console.log(`  ✓ Created idea: ${idea4.title}`);

  // =============================================================================
  // Create Reactions
  // =============================================================================
  console.log('👍 Creating reactions...');

  // Alex (user) reacts to ideas
  await prisma.reaction.create({
    data: {
      type: ReactionType.IN,
      userId: userOnly.id,
      ideaId: idea1.id,
    },
  });
  console.log(`  ✓ Alex liked: ${idea1.title}`);

  await prisma.reaction.create({
    data: {
      type: ReactionType.IN,
      userId: userOnly.id,
      ideaId: idea3.id,
    },
  });
  console.log(`  ✓ Alex liked: ${idea3.title}`);

  await prisma.reaction.create({
    data: {
      type: ReactionType.PASS,
      userId: userOnly.id,
      ideaId: idea2.id,
    },
  });
  console.log(`  ✓ Alex passed on: ${idea2.title}`);

  // Jordan (dual role) reacts to Sarah's ideas
  await prisma.reaction.create({
    data: {
      type: ReactionType.IN,
      userId: dualRole.id,
      ideaId: idea1.id,
    },
  });
  console.log(`  ✓ Jordan liked: ${idea1.title}`);

  // =============================================================================
  // Create Waitlist Entries
  // =============================================================================
  console.log('📝 Creating waitlist entries...');

  // Alex joins waitlists for ideas they liked
  await prisma.waitlistEntry.create({
    data: {
      email: userOnly.email,
      userId: userOnly.id,
      ideaId: idea1.id,
    },
  });
  console.log(`  ✓ Alex joined waitlist for: ${idea1.title}`);

  await prisma.waitlistEntry.create({
    data: {
      email: userOnly.email,
      userId: userOnly.id,
      ideaId: idea3.id,
    },
  });
  console.log(`  ✓ Alex joined waitlist for: ${idea3.title}`);

  // Jordan joins Sarah's waitlist
  await prisma.waitlistEntry.create({
    data: {
      email: dualRole.email,
      userId: dualRole.id,
      ideaId: idea1.id,
    },
  });
  console.log(`  ✓ Jordan joined waitlist for: ${idea1.title}`);

  // Anonymous waitlist entry (no user account)
  await prisma.waitlistEntry.create({
    data: {
      email: 'curious@example.com',
      userId: null, // Anonymous user
      ideaId: idea3.id,
    },
  });
  console.log(`  ✓ Anonymous user joined waitlist for: ${idea3.title}`);

  // =============================================================================
  // Summary
  // =============================================================================
  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  • Users: 3 (1 founder-only, 1 user-only, 1 dual-role)');
  console.log('  • Ideas: 4 (2 from founder-only, 2 from dual-role)');
  console.log('  • Reactions: 4 (3 IN, 1 PASS)');
  console.log('  • Waitlist Entries: 4 (3 registered users, 1 anonymous)');
  console.log('\n🔑 Login credentials for testing:');
  console.log('  • Founder: sarah@techstart.io / password123');
  console.log('  • User: alex@producthunt.com / password123');
  console.log('  • Dual: jordan@innovate.co / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
