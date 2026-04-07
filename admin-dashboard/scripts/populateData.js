// Sample data for populating Firebase database
// Run this script to add initial content to Firestore

const sampleData = {
  // Hero content
  heroContent: [
    {
      id: 'hero-1',
      title: 'Nourishing Ghana\'s Future',
      subtitle: 'Providing nutritious meals to school children across Ghana',
      description: 'The Ghana School Feeding Programme ensures that every child has access to quality nutrition, supporting their growth, education, and development.',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      buttonText: 'Learn More',
      buttonLink: '#about',
      featuredSections: ['hero'],
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'hero-2',
      title: 'Healthy Meals, Bright Futures',
      subtitle: 'Partnering with local communities for sustainable nutrition',
      description: 'Our programme works with local farmers and caterers to provide fresh, locally-sourced meals that promote both health and economic development.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      buttonText: 'Our Impact',
      buttonLink: '#impact',
      featuredSections: ['hero'],
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Sample articles
  articles: [
    {
      id: 'article-1',
      title: 'School Feeding Programme Reaches 2 Million Children',
      excerpt: 'The Ghana School Feeding Programme has successfully expanded to reach over 2 million school children nationwide.',
      content: 'The Ghana School Feeding Programme (GSFP) has achieved a significant milestone by providing nutritious meals to over 2 million school children across all 16 regions of Ghana. This expansion has been made possible through partnerships with local farmers, caterers, and international organizations.',
      type: 'news',
      status: 'published',
      featuredSections: [],
      mediaUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'article-2',
      title: 'Nutrition Education Workshop Success',
      excerpt: 'Over 500 teachers participated in our nutrition education training workshop.',
      content: 'The Ministry of Gender, Children and Social Protection organized a comprehensive nutrition education workshop that trained over 500 teachers on healthy eating habits and meal planning for school children.',
      type: 'news',
      status: 'published',
      featuredSections: [],
      mediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Sample gallery items
  gallery: [
    {
      id: 'gallery-1',
      title: 'School Feeding in Action',
      description: 'Children enjoying nutritious meals at Aburi Presbyterian Primary School',
      imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'school-feeding',
      createdAt: new Date()
    },
    {
      id: 'gallery-2',
      title: 'Community Garden Project',
      description: 'Farmers harvesting vegetables for the school feeding programme',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'community',
      createdAt: new Date()
    }
  ],

  // Sample events
  events: [
    {
      id: 'event-1',
      title: 'National Nutrition Awareness Day',
      description: 'Join us for a day of activities promoting healthy eating habits',
      date: new Date('2024-06-15'),
      location: 'Accra International Conference Centre',
      status: 'upcoming',
      createdAt: new Date()
    },
    {
      id: 'event-2',
      title: 'Farmer Training Workshop',
      description: 'Training session for local farmers participating in the GSFP',
      date: new Date('2024-07-20'),
      location: 'Tamale Technical University',
      status: 'upcoming',
      createdAt: new Date()
    }
  ]
};

export default sampleData;

// To use this data:
// 1. Import this file in your Firebase admin script
// 2. Use the Firestore batch write to add all data
// 3. Run the script with proper Firebase credentials

console.log('Sample data exported. Use this to populate your Firebase database.');
