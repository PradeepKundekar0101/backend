import { Document } from "mongoose";
import { deleteObject, getObjectURL, putObjectURL } from "../aws/s3";
import Category, { ICategory } from "../models/category";
import productServices from "./product";
import AppError from "../utils/AppError";

type IUpdatedCategory = Document<unknown, {}, ICategory>;

class CategoryService {
  async createCategory(
    categoryData: Partial<ICategory>,
    categoryImage: Express.Multer.File
  ): Promise<ICategory> {
    const imageName = await putObjectURL(categoryImage, "category");
    const category = await Category.create({
      name: categoryData.name,
      image_name: imageName,
    });
    return category;
  }

  async getAllCategories(): Promise<ICategory[]> {
    const categories = await Category.find();
    for (const category of categories) {
      const image_name = category.image_name;
      category.image_url = await getObjectURL(image_name);
    }
    return categories;
  }

  async getCategoryById(categoryId: string): Promise<ICategory | null> {
    const category = await Category.findById(categoryId);
    if (!category) return null;
    const image_name = category?.image_name;
    category.image_url = await getObjectURL(image_name);
    return category;
  }

  async updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>,
    categoryImage: Express.Multer.File | undefined
  ): Promise<ICategory | null> {
    let imageName: string | undefined;
    if (categoryImage) {
      imageName = await putObjectURL(categoryImage, "category");
    }
    if (imageName) {
      categoryData.image_name = imageName;
    }
    const category = await Category.findByIdAndUpdate(
      categoryId,
      categoryData,
      { new: true }
    );
    return category;
  }

  async deleteCategory(categoryId: string): Promise<IUpdatedCategory | null> {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError(400, "Category not found");
    }

    // // Delete all the tags and videos related to product:
    // for (const product of productsToBeDeleted) {
    //   await productServices.deleteProduct(product._id);
    // }

    //Delete the Image from s3
    const categoryFound = await Category.findById(categoryId);
    if (!categoryFound) return null;
    await deleteObject(categoryFound.image_name);
    await category.updateOne(
      {
        is_discontinued: true,
      },
      { new: true }
    );

    return category;
  }
}

export default new CategoryService();
