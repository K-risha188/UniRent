const aiController = require('./controllers/aiController');

// Mock request and response objects
const createMockReq = (body) => ({
  body
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

async function testRecommendation() {
  console.log("=== STARTING AI CONTROLLER INTEGRATION VERIFICATION ===");
  
  // Test case 1: Normal item in good condition
  console.log("\nTesting Case 1: DSLR Camera (Original Price: ₹50,000, Condition: Good)");
  const req1 = createMockReq({
    name: "Canon EOS 1500D DSLR Camera",
    category: "Electronics",
    condition: "Good",
    originalPrice: 50000,
    description: "Comes with standard 18-55mm lens and battery charger. Used for a semester project."
  });
  const res1 = createMockRes();
  
  await aiController.getRecommendation(req1, res1);
  
  console.log("Response Status Code:", res1.statusCode);
  console.log("Response Data:", JSON.stringify(res1.jsonData, null, 2));

  if (res1.statusCode === 200 && res1.jsonData.success === true) {
    console.log("✅ Case 1: Passed!");
  } else {
    console.error("❌ Case 1: Failed!");
    process.exit(1);
  }

  // Test case 2: Overpriced new item
  console.log("\nTesting Case 2: Graphing Calculator (Original Price: ₹15,000, Condition: New)");
  const req2 = createMockReq({
    name: "TI-Nspire CX II CAS Graphing Calculator",
    category: "Calculators",
    condition: "New",
    originalPrice: 15000,
    description: "Brand new, never opened. Perfect for algebra, calculus, and physics."
  });
  const res2 = createMockRes();

  await aiController.getRecommendation(req2, res2);

  console.log("Response Status Code:", res2.statusCode);
  console.log("Response Data:", JSON.stringify(res2.jsonData, null, 2));

  if (res2.statusCode === 200 && res2.jsonData.success === true) {
    console.log("✅ Case 2: Passed!");
  } else {
    console.error("❌ Case 2: Failed!");
    process.exit(1);
  }

  // Test case 3: Validation failure (missing name)
  console.log("\nTesting Case 3: Missing parameters validation check");
  const req3 = createMockReq({
    condition: "Good",
    originalPrice: 1000
  });
  const res3 = createMockRes();

  await aiController.getRecommendation(req3, res3);

  console.log("Response Status Code:", res3.statusCode);
  console.log("Response Data:", JSON.stringify(res3.jsonData, null, 2));

  if (res3.statusCode === 400 && res3.jsonData.success === false) {
    console.log("✅ Case 3 (Validation check): Passed!");
  } else {
    console.error("❌ Case 3: Failed!");
    process.exit(1);
  }

  console.log("\n=== ✅ ALL AI INTEGRATION CONTROLLER TESTS PASSED SUCCESSFULLY! ===");
}

testRecommendation().catch(err => {
  console.error("Verification failed with error:", err);
  process.exit(1);
});
