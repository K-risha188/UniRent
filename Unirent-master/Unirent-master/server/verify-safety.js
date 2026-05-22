const mongoose = require('mongoose');
const User = require('./models/User');
const Item = require('./models/Item');
const Notification = require('./models/Notification');
const safetyModerator = require('./utils/safetyModerator');
const itemController = require('./controllers/itemController');
const adminController = require('./controllers/adminController');

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unirent';

// Mock request and response objects
const createMockReq = (user, body) => ({
  user,
  body,
  files: []
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function runTests() {
  console.log("=== STARTING SAFETY MODERATION & FLAGGING SYSTEM VERIFICATION SUITE ===");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // Clean up past test safety listings/notifications for deterministic verification
    await Item.deleteMany({ title: /Test Safety/i });
    await Notification.deleteMany({ message: /Security Alert/i });
    await Notification.deleteMany({ message: /flagged/i });
    await Notification.deleteMany({ message: /approved/i });

    // Ensure we have a student and an admin in the database
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log("Creating mock Admin user...");
      admin = new User({
        name: 'System Administrator',
        email: `admin_${Date.now()}@paruluniversity.ac.in`,
        password: 'password123',
        university: 'Parul University',
        role: 'admin',
        idCardImage: 'admin.jpg',
        isVerified: true
      });
      await admin.save();
    }

    let student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log("Creating mock Student user...");
      student = new User({
        name: 'Safety Tester Student',
        email: `student_${Date.now()}@paruluniversity.ac.in`,
        password: 'password123',
        university: 'Parul University',
        role: 'student',
        idCardImage: 'student.jpg',
        isVerified: true
      });
      await student.save();
    }

    console.log(`Using Admin: ${admin.name} (${admin.email})`);
    console.log(`Using Student: ${student.name} (${student.email})`);

    // --- TEST CASE 1: safetyModerator checkSafety (Prohibited Context) ---
    console.log("\n--- TEST CASE 1: Checking safetyModerator checkSafety on Prohibited Text ---");
    const safetyRes1 = await safetyModerator.checkSafety(
      "Tactical hunting rifle for camping",
      "Excellent quality shotgun with high ammunition supply. Handle with care.",
      "Sports"
    );
    console.log("Safety Result:", JSON.stringify(safetyRes1, null, 2));
    if (safetyRes1.isSafe === false && safetyRes1.reason.includes("rifle")) {
      console.log("✅ Case 1 Passed: Successfully flagged prohibited rifle keyword locally/AI.");
    } else {
      throw new Error("❌ Case 1 Failed: Prohibited keyword scan failed to flag.");
    }

    // --- TEST CASE 2: safetyModerator checkSafety (Safe Context) ---
    console.log("\n--- TEST CASE 2: Checking safetyModerator checkSafety on Safe Text ---");
    const safetyRes2 = await safetyModerator.checkSafety(
      "M1 MacBook Pro 2021 for Rent",
      "Excellent condition, 16GB RAM, 512GB SSD. Perfect for software projects.",
      "Electronics"
    );
    console.log("Safety Result:", JSON.stringify(safetyRes2, null, 2));
    if (safetyRes2.isSafe === true) {
      console.log("✅ Case 2 Passed: Safe listing classified correctly.");
    } else {
      throw new Error("❌ Case 2 Failed: Safe listing was falsely flagged.");
    }

    // --- TEST CASE 3: itemController.createItem (Flagging inappropriate listing) ---
    console.log("\n--- TEST CASE 3: Testing itemController.createItem flagging behavior ---");
    const mockReq3 = createMockReq(student, {
      title: "Test Safety: Marijuana Vape Mod",
      description: "Organic premium weed vape gear. Works perfectly.",
      pricePerDay: 200,
      securityDeposit: 800,
      category: "Electronics"
    });
    const mockRes3 = createMockRes();

    await itemController.createItem(mockReq3, mockRes3);
    console.log("Response Status Code:", mockRes3.statusCode);
    const createdItem = mockRes3.jsonData;
    console.log("Created Item:", JSON.stringify(createdItem, null, 2));

    if (createdItem.moderationStatus === 'flagged' && createdItem.isAvailable === false) {
      console.log("✅ Case 3 Passed: Listing successfully saved in database as 'flagged' and hidden ('isAvailable: false').");
    } else {
      throw new Error("❌ Case 3 Failed: Listing was not saved with correct flagged properties.");
    }

    // --- TEST CASE 4: Verification of dispatched Notifications ---
    console.log("\n--- TEST CASE 4: Verifying Admin and Owner notifications ---");
    const adminNotif = await Notification.findOne({
      recipient: admin._id,
      message: /Security Alert/i,
      relatedId: createdItem._id
    });
    const ownerNotif = await Notification.findOne({
      recipient: student._id,
      message: /flagged/i,
      relatedId: createdItem._id
    });

    console.log("Admin Notification:", adminNotif ? adminNotif.message : "Not Found");
    console.log("Owner Notification:", ownerNotif ? ownerNotif.message : "Not Found");

    if (adminNotif && ownerNotif) {
      console.log("✅ Case 4 Passed: Both admin and owner notifications dispatched correctly.");
    } else {
      throw new Error("❌ Case 4 Failed: Notifications missing from database.");
    }

    // --- TEST CASE 5: adminController.approveItem (Unflagging/Approving a flagged listing) ---
    console.log("\n--- TEST CASE 5: Testing adminController.approveItem approval workflow ---");
    const mockReq5 = {
      params: { id: createdItem._id }
    };
    const mockRes5 = createMockRes();

    await adminController.approveItem(mockReq5, mockRes5);
    console.log("Approval Status Code:", mockRes5.statusCode);
    const approvedItem = await Item.findById(createdItem._id);
    console.log("Approved Item state:", JSON.stringify(approvedItem, null, 2));

    if (approvedItem.moderationStatus === 'approved' && approvedItem.isAvailable === true) {
      console.log("✅ Case 5 Passed: Listing successfully approved, unflagged, and made available again.");
    } else {
      throw new Error("❌ Case 5 Failed: Listing did not unflag properly.");
    }

    // --- TEST CASE 6: Verification of Approval Notification ---
    console.log("\n--- TEST CASE 6: Verifying owner success notification after approval ---");
    const successNotif = await Notification.findOne({
      recipient: student._id,
      message: /approved/i,
      relatedId: createdItem._id
    });
    console.log("Owner Success Notification:", successNotif ? successNotif.message : "Not Found");

    if (successNotif) {
      console.log("✅ Case 6 Passed: Success notification dispatched successfully to owner.");
    } else {
      throw new Error("❌ Case 6 Failed: Owner approval notification missing.");
    }

    console.log("\n=========================================================================");
    console.log("🎉 ALL SAFETY MODERATION & CONTEXT FLAGGING TESTS PASSED FLAWLESSLY!");
    console.log("=========================================================================");
    
    process.exit(0);

  } catch (error) {
    console.error("❌ TEST SUITE RUN TERMINATED WITH AN ERROR:", error.message);
    process.exit(1);
  }
}

runTests();
