import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create institutions
  const nitTrichy = await prisma.institution.create({
    data: {
      name: "National Institute of Technology Tiruchirappalli",
      type: "college",
      city: "Tiruchirappalli",
      state: "Tamil Nadu",
      domain: "nit.edu.in",
    },
  });

  const nitWarangal = await prisma.institution.create({
    data: {
      name: "National Institute of Technology Warangal",
      type: "college",
      city: "Warangal",
      state: "Telangana",
      domain: "nitw.ac.in",
    },
  });

  // Create departments
  const cse = await prisma.department.create({
    data: {
      name: "Computer Science",
      institutionId: nitTrichy.id,
    },
  });

  const ece = await prisma.department.create({
    data: {
      name: "Electronics & Communication",
      institutionId: nitTrichy.id,
    },
  });

  const mech = await prisma.department.create({
    data: {
      name: "Mechanical Engineering",
      institutionId: nitTrichy.id,
    },
  });

  // Create batches
  const batch2025 = await prisma.batch.create({
    data: {
      name: "CSE 2025",
      graduationYear: 2025,
      institutionId: nitTrichy.id,
      departmentId: cse.id,
    },
  });

  const batch2026 = await prisma.batch.create({
    data: {
      name: "CSE 2026",
      graduationYear: 2026,
      institutionId: nitTrichy.id,
      departmentId: cse.id,
    },
  });

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const rahul = await prisma.user.create({
    data: {
      email: "rahul.sharma@nit.edu.in",
      password: hashedPassword,
      name: "Rahul Sharma",
      username: "rahul_sharma",
      bio: "CSE Student | Tech Enthusiast",
      institutionId: nitTrichy.id,
      department: "Computer Science",
      graduationYear: 2025,
      verificationLevel: 2,
      isVerified: true,
    },
  });

  const priya = await prisma.user.create({
    data: {
      email: "priya.patel@nit.edu.in",
      password: hashedPassword,
      name: "Priya Patel",
      username: "priya_patel",
      bio: "CSE 2025 | Web Developer",
      institutionId: nitTrichy.id,
      department: "Computer Science",
      graduationYear: 2025,
      verificationLevel: 2,
      isVerified: true,
    },
  });

  const amit = await prisma.user.create({
    data: {
      email: "amit.kumar@nit.edu.in",
      password: hashedPassword,
      name: "Amit Kumar",
      username: "amit_kumar",
      bio: "ECE Student | ML Enthusiast",
      institutionId: nitTrichy.id,
      department: "Electronics & Communication",
      graduationYear: 2026,
      verificationLevel: 2,
      isVerified: true,
    },
  });

  // Create posts
  await prisma.post.create({
    data: {
      content: "Hey everyone! Just posted the DBMS notes for the mid-semester exam. Check them out in the Notes section! 📚",
      authorId: rahul.id,
      batchId: batch2025.id,
    },
  });

  await prisma.post.create({
    data: {
      content: "Tech Club is organizing a hackathon next month! Registrations are open. Form your teams and participate 🚀\n\n#TechClub #Hackathon #NITTrichy",
      authorId: priya.id,
      batchId: batch2025.id,
    },
  });

  // Create clubs
  const techClub = await prisma.club.create({
    data: {
      name: "Tech Club",
      description: "Coding, development, and technology enthusiasts",
      institutionId: nitTrichy.id,
    },
  });

  const culturalClub = await prisma.club.create({
    data: {
      name: "Cultural Club",
      description: "Arts, music, and cultural events",
      institutionId: nitTrichy.id,
    },
  });

  // Create club members
  await prisma.clubMember.create({
    data: {
      clubId: techClub.id,
      userId: rahul.id,
      role: "member",
    },
  });

  await prisma.clubMember.create({
    data: {
      clubId: techClub.id,
      userId: priya.id,
      role: "admin",
    },
  });

  // Create rooms
  await prisma.room.create({
    data: {
      name: "CSE 2025",
      description: "Computer Science batch 2025 students",
      type: "class",
      institutionId: nitTrichy.id,
      batchId: batch2025.id,
      departmentId: cse.id,
    },
  });

  await prisma.room.create({
    data: {
      name: "NIT Trichy Campus",
      description: "Main campus discussions",
      type: "college",
      institutionId: nitTrichy.id,
    },
  });

  await prisma.room.create({
    data: {
      name: "Placement Cell",
      description: "All placement and internship updates",
      type: "placement",
      institutionId: nitTrichy.id,
    },
  });

  // Create events
  await prisma.event.create({
    data: {
      title: "Hackathon 2025",
      description: "24-hour coding competition with exciting prizes",
      location: "Main Auditorium",
      startDate: new Date(Date.now() + 86400000 * 7),
      endDate: new Date(Date.now() + 86400000 * 8),
      organizerId: rahul.id,
      institutionId: nitTrichy.id,
      clubId: techClub.id,
    },
  });

  // Create notes
  await prisma.note.create({
    data: {
      title: "DBMS Unit 1 Notes",
      description: "Complete notes covering Entity-Relationship model and Relational Algebra",
      fileUrl: "/notes/dbms-unit1.pdf",
      subject: "DBMS",
      institutionId: nitTrichy.id,
      batchId: batch2025.id,
      uploadedById: rahul.id,
    },
  });

  // Create jobs
  await prisma.job.create({
    data: {
      title: "Software Development Engineer",
      company: "Google",
      description: "Looking for talented SDEs to join our team.",
      jobType: "full-time",
      location: "Bangalore",
      salary: "₹25-35 LPA",
      applyLink: "https://careers.google.com",
      institutionId: nitTrichy.id,
      postedById: rahul.id,
    },
  });

  await prisma.job.create({
    data: {
      title: "Summer Internship 2025",
      company: "Microsoft",
      description: "4-month internship program for pre-final year students.",
      jobType: "internship",
      location: "Hyderabad",
      salary: "₹50,000/month",
      applyLink: "https://careers.microsoft.com",
      institutionId: nitTrichy.id,
      postedById: rahul.id,
    },
  });

  // Create lost items
  await prisma.lostItem.create({
    data: {
      title: "Blue Backpack",
      description: "Left in the library yesterday. Contains laptop.",
      location: "Central Library, 2nd Floor",
      status: "lost",
      institutionId: nitTrichy.id,
      postedById: rahul.id,
    },
  });

  // Create marketplace items
  await prisma.marketplaceItem.create({
    data: {
      title: "DBMS Textbook - Korth",
      description: "Database System Concepts, 7th Edition",
      price: 450,
      category: "books",
      condition: "Like new",
      institutionId: nitTrichy.id,
      postedById: priya.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
