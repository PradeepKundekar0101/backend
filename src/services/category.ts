import { Document } from "mongoose";
import productServices from "./product";
import Category, { ICategory } from "../models/category";
import AppError from "../utils/AppError";

type IUpdatedCategory = Document<unknown, {}, ICategory>;

class CategoryService {
  async createCategory(categoryData: ICategory): Promise<ICategory> {
    const category = await Category.create(categoryData);
    return category;
  }

  async getAllCategories(): Promise<ICategory[]> {
    const categories = await Category.find();
    return categories;
  }

  async getCategoryById(categoryId: string): Promise<ICategory | null> {
    const category = await Category.findById(categoryId);
    return category;
  }

  async updateCategory(
    categoryId: string,
    categoryData: ICategory
  ): Promise<IUpdatedCategory | null> {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      categoryData,
      { new: true }
    ).exec();

    return category;
  }

  async deleteCategory(categoryId: string): Promise<IUpdatedCategory | null> {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError(400, "Category not found");
    }

    //Delete all the products related to category
    const productsToBeDeleted = await productServices.getAllProducts({
      category: categoryId,
    });

    // // Delete all the products and videos associated to it:
    for (const product of productsToBeDeleted) {
      await productServices.deleteProduct(product._id);
    }

    await category
      .updateOne(
        {
          is_discontinued: true,
        },
        { new: true }
      )
      .exec();

    return category;
  }
}

export default new CategoryService();
