import AppError from "../utils/AppError";
import Category, { ICategory } from "../models/category";

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
  ): Promise<ICategory | null> {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      categoryData,
      { new: true }
    );
    return category;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await Category.findByIdAndDelete(categoryId);

    if (!category)
      throw new AppError(404, `Category with id ${categoryId} not found`);
  }
}

export default new CategoryService();
