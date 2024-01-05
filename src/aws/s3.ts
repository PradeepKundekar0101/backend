import { DeleteObjectCommand, GetObjectCommand,PutObjectCommand} from "@aws-sdk/client-s3"
import { s3Client } from "../config/aws"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const getObjectURL = async(key:string)=>{
    const command = new GetObjectCommand({
        Key:key,
        Bucket:process.env.BUCKET_NAME
    })
    const url = await getSignedUrl(s3Client,command);
    return url;
}
export const putObjectURL = async(file:Express.Multer.File,dist:string)=>{
    try {
        let imageName = "";
        if(dist==="category")
            imageName = "uploads/category/image-"+Date.now();
        else if(dist==="product")
            imageName = "uploads/product/image-"+Date.now();
        else if(dist==="helpdesk")
            imageName = "uploads/helpdesk/image-"+Date.now();

        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Body: file.buffer,
            Key: imageName,
            ContentType: file.mimetype,
          }
        await s3Client.send(new PutObjectCommand(uploadParams));
        return imageName;
    } catch (error:any) {
        console.log(error.message);
    }
}
export const deleteObject = async(key:string)=>{
    try {
        const command = new DeleteObjectCommand({
            Key:key,
            Bucket:process.env.BUCKET_NAME
        })
        await s3Client.send(command);
    } catch (error:any) {
        console.log(error.message)
    }
}