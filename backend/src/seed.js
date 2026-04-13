const Habit = require('./models/Habit');

const sampleHabits = [
  { name: 'Drink 2L Water', status: false },
  { name: 'Read 10 Pages', status: true },
  { name: 'Workout for 30 minutes', status: false },
  { name: 'Meditate for 10 minutes', status: false }
];

const seedDB = async () => {
  try {
    const count = await Habit.countDocuments();
    if (count === 0) {
      console.log('Database is empty. Seeding initial habits...');
      await Habit.insertMany(sampleHabits);
      console.log('Database seeded successfully.');
    } else {
      console.log(`Database already has ${count} habits. Skipping seed.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDB;
