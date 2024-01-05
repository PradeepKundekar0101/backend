import { Document, ObjectId } from "mongoose";
import Product, { IProduct } from "../models/product";
import Tag from "../models/tag";
import videoServices from "./video";
import AppError from "../utils/AppError";
import { deleteObject, getObjectURL, putObjectURL } from "../aws/s3";

type IUpdatedProduct = Document<unknown, {}, IProduct>;

class ProductService {
  //Function to create Product
  async createProduct(
    productData: Partial<IProduct>,
    productImage: Express.Multer.File
  ): Promise<IProduct> {
    const imageName = await putObjectURL(productImage, "product");
    const product = await Product.create({
      name: productData.name,
      category: productData.category,
      image_name: imageName,
    });
    return product;
  }

  //Function to get all products
  async getAllProducts(queryParams?: any): Promise<IProduct[]> {
    let productQuery = Product.find({});
    if (queryParams && queryParams.category)
      productQuery = productQuery
        .where("category")
        .equals(queryParams.category);
    const products = await productQuery.exec();

    for (const product of products) {
      const image_name = product.image_name;
      product.image_url = await getObjectURL(image_name);
    }
    return products;
  }

  //Function to get product By Id
  async getProduct(productId: string): Promise<IProduct | null> {
    const product = await Product.findOne({ _id: productId });
    if (!product) return null;
    const image_name = product?.image_name;
    product.image_url = await getObjectURL(image_name);
    return product;
  }

  //Function to update a Product
  async updateProduct(
    productId: string,
    productData: Partial<IProduct>,
    productImage: Express.Multer.File | undefined
  ): Promise<IUpdatedProduct | null> {
    let imageName: string | undefined;
    if (productImage) {
      imageName = await putObjectURL(productImage, "product");
    }
    if (imageName) {
      productData.image_name = imageName;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    ).exec();
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

    product.tags.splice(0, product.tags.length);
    for (const tagName of tags) {
      let existingTag = await Tag.findOne({ name: tagName });
      if (!existingTag) {
        existingTag = await Tag.create({ name: tagName });
      }
      product.tags.push(existingTag._id as unknown as ObjectId);
    }

    product.is_active = true;
    await product.save();
    return product;
  }

  // Function to delete a Product
  async deleteProduct(productId: string): Promise<IUpdatedProduct | null> {
    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError(400, "Product not found");
    }

    // Delete all the videos related to product:
    const videosOfProductToBeDeleted = await videoServices.getVideosByProductId(
      productId
    );

    for (const video of videosOfProductToBeDeleted) {
      await videoServices.deleteVideo(video._id);
    }

    // const deleteProduct = await Product.findByIdAndDelete(productId);
    await product.updateOne({ is_discontinued: true }, { new: true }).exec();

    return product;
  }
}
export default new ProductService();
