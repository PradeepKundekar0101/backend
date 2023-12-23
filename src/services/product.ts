import { Document, ObjectId } from "mongoose";
import Product, { IProduct } from "../models/product";
import Tag from "../models/tag";
import AppError from "../utils/AppError";

type IUpdatedProduct = Document<unknown, {}, IProduct>;

class ProductService {
  //Function to create Product
  async createProduct(productData: IProduct): Promise<IProduct> {
    const product = await Product.create(productData);
    return product;
  }

  //Function to get all products
  async getAllProducts(queryParams?: any): Promise<IProduct[]> {
    let productQuery = Product.find();
    if (queryParams && queryParams.category)
      productQuery = productQuery
        .where("category")
        .equals(queryParams.category);
    const products = await productQuery.exec();
    return products;
  }

  //Function to get product By Id
  async getProduct(productId: string): Promise<IProduct | null> {
    const product = await Product.findById(productId);
    return product;
  }

  //Function to update a Product
  async updateProduct(
    productId: string,
    productData: IProduct
  ): Promise<IUpdatedProduct | null> {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );
    return updatedProduct;
  }

  //Function to add Tags to a product
  async updateProductWithTags(
    productId: string,
    tags: string[]
  ): Promise<IUpdatedProduct | null> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(400, "Product not found");
    }
    for (const tagName of tags) {
      let existingTag = await Tag.findOne({ name: tagName });
      if (!existingTag) {
        existingTag = await Tag.create({ name: tagName });
      }
      product.tags.push(existingTag._id as unknown as ObjectId);
    }
    await product.save();

    return product;
  }

  // Function to delete a Product
  async deleteProduct(productId: string): Promise<IUpdatedProduct | null> {
    //Delete all the tags related to product
    // for (const tag of product.tags) {
    //   await Tag.findByIdAndDelete(tag);
    // }

    // const videosOfProductToBeDeleted = await videoServices.getVideosByProductId(
    //   productId
    // );

    // for (const video of videosOfProductToBeDeleted) {
    //   await videoServices.deleteVideo(video._id);
    // }

    // const deleteProduct = await Product.findByIdAndDelete(productId);
    const product = await Product.findByIdAndUpdate(
      productId,
      { is_discontinued: true },
      { new: true }
    );

    return product;
  }
}
export default new ProductService();
