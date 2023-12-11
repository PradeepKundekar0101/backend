import mongoose, { ObjectId, Types } from 'mongoose';
import Product, { IProduct } from '../models/product'
import Tag, { ITag } from '../models/tag';
import AppError from '../utils/AppError';

class ProductService{

    //Function to create Product 
    public static async createProduct(productData: IProduct) : Promise<IProduct> {
        const product = await Product.create(productData);
        return product;
    }

    //Function to get all products 
    public static async getAllProducts(): Promise<IProduct[]> {
        const products = await Product.find();
        return products;
    }

     //Function to get product By Id
     public static async getProduct(productId:string): Promise<IProduct|null> {
        const product = await Product.findById(productId);
        return product;
    }

    //Function to update a Product 
    public static async updateProduct(productId:string,productData: IProduct) : Promise<IProduct | null>
    {
        const updatedProduct = await Product.findByIdAndUpdate(productId,{productData},{new:true})
        return updatedProduct;
    }
    
    //Function to add Tags to a product
    public static async updateProductWithTags(productId:string,tags:string[] ): Promise<IProduct | null>
    {
        const product = await Product.findById(productId);
        if (!product){
            throw new AppError(400,"Product not found");
        }
        for(const tagName of tags)
        {
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
    public static async deleteProduct(productId:string):Promise<IProduct|null>{
        const product = await Product.findById(productId);
        if (product)
        {
            //Delete all the tags related to product
            for(const tag of product.tags){
                const deletedTag = await Tag.findByIdAndDelete(tag);
            }
            const deleteProduct = await Product.findByIdAndDelete(productId);
            return deleteProduct;
        }
        return null;
    }
}
export default ProductService;