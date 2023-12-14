import { mongoConnect } from "../services/mongo.connect";
import dotenv from "dotenv";
import data from "../data/seed.json";

dotenv.config();

mongoConnect(process.env.MONGO_URI!);

import Category from "../models/category";
import Analytics from "../models/analytics";
import Tag from "../models/tag";
import Product from "../models/product";
import Video from "../models/video";
import mongoose from "mongoose";

// const seedTags = async () => {
//   await Tag.deleteMany({});
//   await Tag.insertMany(data.tags);
// };

// const seedCategories = async () => {
//   await Category.deleteMany({});
//   await Category.insertMany(data.categories);
// };

// const seedProducts = async () => {
//   await Product.deleteMany({});
//   const category = await Category.find({});

//   await Product.insertMany(
//     data.products.map((product, index) => ({
//       ...product,
//       category: category[index % category.length]._id,
//     }))
//   );
// };

// const seedVideos = async () => {
//   await Video.deleteMany({});
//   const products = await Product.find({});

//   for (let i = 0, j = 0; i < 2; i++, j += 4) {
//     await Video.insertMany([
//       {
//         productId: products[i]._id,
//         videoId: data.videos[j].videoId,
//       },
//       {
//         productId: products[i]._id,
//         videoId: data.videos[j + 1].videoId,
//       },
//       {
//         productId: products[i]._id,
//         videoId: data.videos[j + 2].videoId,
//       },
//       {
//         productId: products[i]._id,
//         videoId: data.videos[j + 3].videoId,
//       },
//     ]);
//   }
// };

// const seedProductAndVideoTags = async () => {
//   const products = await Product.find({});
//   const videos = await Video.find({});
//   const tags = await Tag.find({});

//   await Product.findByIdAndUpdate(products[0]._id, {
//     $push: { tags: [tags[0]._id, tags[1]._id, tags[2]._id, tags[3]._id] },
//   });

//   for (let i = 0; i < 4; i++) {
//     await Video.findByIdAndUpdate(videos[i]._id, {
//       $push: { tags: [tags[0]._id, tags[1]._id, tags[2]._id, tags[3]._id] },
//     });
//   }
// };

// seedTags()
//   .then(() => seedCategories())
//   .then(() => seedProducts())
//   .then(() => seedVideos())
// .then(() =>
// seedProductAndVideoTags()
//   .then(() => {
//     console.log("Data seeded successfully");
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.log(err);
//     process.exit(1);
//   });

const seedAnalytics = async () => {
  await Analytics.deleteMany({});
  await Analytics.insertMany(data.analytics);
};

seedAnalytics()
  .then(() => {
    console.log("Data seeded successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
