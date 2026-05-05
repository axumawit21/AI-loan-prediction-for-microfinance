import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.create(AppModule);
  
  const saccoModel = app.get('SaccoModel');
  const userModel = app.get('UserModel');
  const clientModel = app.get('ClientModel');
  
  // Seed default SACCO
  console.log('Seeding SACCOs...');
  let frankSacco = await saccoModel.findOne({ name: 'FRANK' });
  if (!frankSacco) {
    frankSacco = await saccoModel.create({ name: 'FRANK', isActive: true });
    console.log('  ✅ Created SACCO: FRANK');
  } else {
    console.log('  ⏭️  SACCO exists: FRANK');
  }
  const saccoId = frankSacco._id;

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const officerPassword = await bcrypt.hash('officer123', 12);
  const committeePassword = await bcrypt.hash('committee123', 12);
  const managerPassword = await bcrypt.hash('manager123', 12);
  
  // Seed users — all 4 roles matching BACKEND_API_DOCS.md
  const users = [
    {
      name: 'Admin User',
      email: 'admin@sacco.com',
      password: adminPassword,
      role: 'admin',
      phone: '+251911000001',
      isActive: true,
    },
    {
      name: 'Abebe Kebede',
      email: 'officer@sacco.com',
      password: officerPassword,
      role: 'loan_officer',
      phone: '+251911000002',
      isActive: true,
      saccoId,
    },
    {
      name: 'Fatima Ali',
      email: 'officer2@sacco.com',
      password: officerPassword,
      role: 'loan_officer',
      phone: '+251911000005',
      isActive: true,
      saccoId,
    },
    {
      name: 'Kebede Tadesse',
      email: 'committee@sacco.com',
      password: committeePassword,
      role: 'committee',
      phone: '+251911000003',
      isActive: true,
      saccoId,
    },
  ];
  
  console.log('\nSeeding users...');
  for (const user of users) {
    const existing = await userModel.findOne({ email: user.email });
    if (!existing) {
      await userModel.create(user);
      console.log(`  ✅ Created user: ${user.email} (${user.role})`);
    } else {
      // Update existing users with saccoId if missing
      if (!existing.saccoId) {
        await userModel.updateOne({ _id: existing._id }, { saccoId });
        console.log(`  🔄 Updated user with SACCO: ${user.email}`);
      } else {
        console.log(`  ⏭️  User exists: ${user.email}`);
      }
    }
  }
  
  // Seed clients with membershipDate
  const officerUser = await userModel.findOne({ email: 'officer@sacco.com' });
  const officer2User = await userModel.findOne({ email: 'officer2@sacco.com' });

  const clients = [
    {
      name: 'Tigist Haile',
      phone: '+251922345678',
      email: 'tigist@email.com',
      address: 'Addis Ababa, Bole',
      gender: 'female',
      dateOfBirth: new Date('1990-05-15'),
      nationalId: 'ETH-1234567890',
      businessType: 'Retail Trade',
      membershipDate: new Date('2022-01-15'),
      totalSavings: 45000,
      monthlySavings: 3000,
      status: 'active',
      registeredBy: officerUser?._id,
      saccoId,
    },
    {
      name: 'Mulugeta Tadesse',
      phone: '+251933456789',
      email: 'mulugeta@email.com',
      address: 'Addis Ababa, Merkato',
      gender: 'male',
      dateOfBirth: new Date('1985-08-22'),
      nationalId: 'ETH-2345678901',
      businessType: 'Manufacturing',
      membershipDate: new Date('2021-06-10'),
      totalSavings: 120000,
      monthlySavings: 8000,
      status: 'active',
      registeredBy: officerUser?._id,
      saccoId,
    },
    {
      name: 'Hiwot Gebre',
      phone: '+251944567890',
      email: 'hiwot@email.com',
      address: 'Bahir Dar, Kebele 05',
      gender: 'female',
      dateOfBirth: new Date('1992-03-10'),
      nationalId: 'ETH-3456789012',
      businessType: 'Agriculture',
      membershipDate: new Date('2023-02-20'),
      totalSavings: 25000,
      monthlySavings: 2000,
      status: 'active',
      registeredBy: officer2User?._id,
      saccoId,
    },
    {
      name: 'Yonas Bekele',
      phone: '+251955678901',
      email: 'yonas@email.com',
      address: 'Hawassa, Main Road',
      gender: 'male',
      dateOfBirth: new Date('1988-11-05'),
      nationalId: 'ETH-4567890123',
      businessType: 'Transport',
      membershipDate: new Date('2020-09-01'),
      totalSavings: 200000,
      monthlySavings: 15000,
      status: 'active',
      registeredBy: officerUser?._id,
      saccoId,
    },
    {
      name: 'Meron Assefa',
      phone: '+251966789012',
      email: 'meron@email.com',
      address: 'Dire Dawa, Kezira',
      gender: 'female',
      dateOfBirth: new Date('1995-07-18'),
      nationalId: 'ETH-5678901234',
      businessType: 'Food & Beverage',
      membershipDate: new Date('2023-08-15'),
      totalSavings: 15000,
      monthlySavings: 1500,
      status: 'active',
      registeredBy: officer2User?._id,
      saccoId,
    },
    {
      name: 'Daniel Worku',
      phone: '+251977890123',
      email: 'daniel@email.com',
      address: 'Adama, Kebele 03',
      gender: 'male',
      dateOfBirth: new Date('1980-01-25'),
      nationalId: 'ETH-6789012345',
      businessType: 'Construction',
      membershipDate: new Date('2019-04-10'),
      totalSavings: 350000,
      monthlySavings: 20000,
      status: 'active',
      registeredBy: officerUser?._id,
      saccoId,
    },
    {
      name: 'Bethlehem Tadesse',
      phone: '+251988901234',
      email: 'bethlehem@email.com',
      address: 'Jimma, Abajifar',
      gender: 'female',
      dateOfBirth: new Date('1993-12-30'),
      nationalId: 'ETH-7890123456',
      businessType: 'Services',
      membershipDate: new Date('2022-11-01'),
      totalSavings: 60000,
      monthlySavings: 5000,
      status: 'active',
      registeredBy: officer2User?._id,
      saccoId,
    },
    {
      name: 'Solomon Desta',
      phone: '+251999012345',
      email: 'solomon@email.com',
      address: 'Mekelle, Adi Haki',
      gender: 'male',
      dateOfBirth: new Date('1978-06-14'),
      nationalId: 'ETH-8901234567',
      businessType: 'Wholesale',
      membershipDate: new Date('2018-03-20'),
      totalSavings: 500000,
      monthlySavings: 25000,
      status: 'inactive',
      registeredBy: officerUser?._id,
      saccoId,
    },
  ];
  
  console.log('\nSeeding clients...');
  for (const client of clients) {
    const existing = await clientModel.findOne({ phone: client.phone });
    if (!existing) {
      await clientModel.create(client);
      console.log(`  ✅ Created client: ${client.name}`);
    } else {
      if (!existing.saccoId) {
        await clientModel.updateOne({ _id: existing._id }, { saccoId });
        console.log(`  🔄 Updated client with SACCO: ${client.name}`);
      } else {
        console.log(`  ⏭️  Client exists: ${client.name}`);
      }
    }
  }

  // Migrate any existing clients/loans without saccoId
  const loanModel = app.get('LoanModel');
  const clientsMigrated = await clientModel.updateMany({ saccoId: { $exists: false } }, { saccoId });
  const loansMigrated = await loanModel.updateMany({ saccoId: { $exists: false } }, { saccoId });
  if (clientsMigrated.modifiedCount > 0) console.log(`\n  🔄 Migrated ${clientsMigrated.modifiedCount} clients to FRANK SACCO`);
  if (loansMigrated.modifiedCount > 0) console.log(`  🔄 Migrated ${loansMigrated.modifiedCount} loans to FRANK SACCO`);
  
  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  admin@sacco.com     / admin123');
  console.log('  officer@sacco.com   / officer123');
  console.log('  officer2@sacco.com  / officer123');
  console.log('  committee@sacco.com / committee123');
  
  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
