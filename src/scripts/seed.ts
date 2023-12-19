import { mongoConnect } from "../services/mongo.connect";
import dotenv from "dotenv";
import categories from "../data/seed.categories.json";
import products from "../data/seed.products.json";
import tags from "../data/seed.tags.json";
import videos from "../data/seed.videos.json";
import analytics from "../data/seed.analytics.json";
import { ObjectId } from "mongodb";

dotenv.config();

mongoConnect(process.env.MONGO_URI!);

import Category from "../models/category";
import Analytics from "../models/analytics";
import Tag from "../models/tag";
import Product from "../models/product";
import Video from "../models/video";
import mongoose from "mongoose";
import category from "../services/category";

function convertObjectId(obj: any) {
  if (obj && obj.$oid) {
    return obj.$oid;
  }
  return obj;
}

function convertDate(obj: any) {
  if (obj && obj.$date) {
    return obj.$date;
  }
  return obj;
}

// Seed categories:
const seedCategories = async () => {
  try {
    await Category.deleteMany({});

    const data = categories.map((category) => ({
      ...category,
      _id: convertObjectId(category._id),
      createdAt: convertDate(category.createdAt),
      updatedAt: convertDate(category.updatedAt),
    }));
    await Category.insertMany(data);
    console.log("Categories seeded");
  } catch (error) {
    console.log(error);
  }
};

// Seed Tags:
const seedTags = async () => {
  try {
    await Tag.deleteMany({});
    const data = tags.map((tag) => ({ ...tag, _id: convertObjectId(tag._id) }));
    await Tag.insertMany(data);
    console.log("Tags seeded");
  } catch (error) {
    console.log(error);
  }
};

// Seed Products:
const seedProducts = async () => {
  try {
    await Product.deleteMany({});
    const data = products.map((product) => ({
      ...product,
      _id: convertObjectId(product._id),
      category: convertObjectId(product.category),
      tags: product.tags.map(convertObjectId),
      createdAt: convertDate(product.createdAt),
      updatedAt: convertDate(product.updatedAt),
    }));
    await Product.insertMany(data);
    console.log("Products seeded");
  } catch (error) {
    console.log(error);
  }
};

// Seed Videos:
const seedVideos = async () => {
  try {
    await Video.deleteMany({});
    const data = videos.map((video) => ({
      ...video,
      _id: convertObjectId(video._id),
      productId: convertObjectId(video.productId),
      tags: video.tags.map(convertObjectId),
      createdAt: convertDate(video.createdAt),
      updatedAt: convertDate(video.updatedAt),
    }));
    await Video.insertMany(data);
    console.log("Videos seeded");
  } catch (error) {
    console.log(error);
  }
};

// Seed Analytics:
const seedAnalytics = async () => {
  try {
    await Analytics.deleteMany({});
    const data = analytics.map((analytic) => ({
      ...analytic,
      _id: convertObjectId(analytic._id),
      categorySelected: convertObjectId(analytic.categorySelected),
      productSelected: convertObjectId(analytic.productSelected),
      tagsSelected: analytic.tagsSelected.map(convertObjectId),
      videosWatched: analytic.videosWatched.map((video) => ({
        ...video,
        _id: convertObjectId(video._id),
        videoId: convertObjectId(video.videoId),
      })),
      createdAt: convertDate(analytic.createdAt),
      updatedAt: convertDate(analytic.updatedAt),
    }));

    data.forEach((analytic) => {
      if (analytic.customerSupportMetadata) {
        analytic.customerSupportMetadata._id = convertObjectId(
          analytic.customerSupportMetadata._id
        );
      }
    });

    await Analytics.insertMany(data);
    console.log("Analytics seeded");
  } catch (error) {
    console.log(error);
  }
};

// Run all seed functions:
const seed = async () => {
  await seedCategories();
  await seedTags();
  await seedProducts();
  await seedVideos();
  await seedAnalytics();
  mongoose.disconnect();
};

seed();
