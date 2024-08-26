import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET  
});

// Important: Make sure the file path provided is correct and accessible.



const uploadFileToCloudinary = async (localFilePath) => {

    // console.log("Entered into cloudinary")
    //upload the file on cloudinary
    try {

        // console.log("Entered into cloudinary try")
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto",
            
        })
        //file has been uploaded successfully
        // console.log("file is uploaded on cloudinary",response.url)
        
        fs.unlinkSync(localFilePath);   //remove the locally saved temporary file after successful upload
        

        return response;
    } catch (error) {

        // console.log("Error in cloudinary catch: ",error)
        
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }

}

export  {uploadFileToCloudinary};