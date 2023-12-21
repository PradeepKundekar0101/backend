import Category, { ICategory } from "../models/category";
import productServices from "./product";

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

  async deleteCategory(categoryId: string): Promise<ICategory | null> {
    // // Delete all the products related to category
    // const productsToBeDeleted = await productServices.getAllProducts({
    //   category: categoryId,
    // });

    // // Delete all the tags and videos related to product:
    // for (const product of productsToBeDeleted) {
    //   await productServices.deleteProduct(product._id);
    // }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        is_discontinued: true,
      },
      { new: true }
    );

    return category;
  }
}

export default new CategoryService();
