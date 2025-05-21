// const mongoose = require('mongoose');
// const { Course } = require('../Models/CourseModel');

// async function cleanExpiredDiscounts() {
//   try {
//     // const result = await Course.updateMany(
//     //   { 
//     //     'discount.expiresAt': { $lt: new Date() },
//     //     discount: { $exists: true }
//     //   },
//     //   { 
//     //     $unset: { discount: "" },
//     //     $set: { discountedPrice: "$price" }
//     //   }
//     // );

//     const result = await Course.updateMany(
//         {
//           'discount.expiresAt': { $lt: new Date() },
//           discount: { $exists: true }
//         },
//         [
//           { $set: { discountedPrice: "$price" } },
//           { $unset: "discount" }
//         ]
//       );
      
    
//     console.log(`✅ Cleaned ${result.nModified} expired discounts`);
//     return result;
//   } catch (error) {
//     console.error('❌ Error cleaning expired discounts:', error);
//     throw error;
//   }
// }

// // For manual testing: node cleanExpiredDiscounts.js
// if (require.main === module) {
//   require('../DataBase/connectDB'); // Your DB connection file
//   cleanExpiredDiscounts()
//     .then(() => process.exit(0))
//     .catch(() => process.exit(1));
// }

// module.exports = cleanExpiredDiscounts;


const mongoose = require('mongoose');
const { Course } = require('../Models/CourseModel');

async function cleanExpiredDiscounts() {
  let connection;
  try {
    // 1. Establish new connection with longer timeout
    connection = await mongoose.createConnection(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    
    const CourseModel = connection.model('Course', Course.schema);

    // 2. Find expired discounts in batches
    const batchSize = 100;
    let processed = 0;
    let shouldContinue = true;

    while (shouldContinue) {
      const batch = await CourseModel.find({
        'discount.expiresAt': { $lt: new Date() },
        discount: { $exists: true }
      })
      .limit(batchSize)
      .select('price _id')
      .lean();

      if (batch.length === 0) {
        shouldContinue = false;
        break;
      }

      // 3. Process batch
      const bulkOps = batch.map(course => ({
        updateOne: {
          filter: { _id: course._id },
          update: {
            $unset: { discount: "" },
            $set: { discountedPrice: course.price }
          }
        }
      }));

      const result = await CourseModel.bulkWrite(bulkOps);
      processed += result.modifiedCount;
      console.log(`Processed ${processed} discounts so far...`);

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ Successfully cleaned ${processed} expired discounts`);
    return processed;

  } catch (error) {
    console.error('❌ Error cleaning expired discounts:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// For manual testing
if (require.main === module) {
  require('dotenv').config();
//   require('../DataBase/connectDB'); // Your DB connection file
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  cleanExpiredDiscounts()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = cleanExpiredDiscounts;