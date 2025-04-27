
import path from "path";
import fs from "fs";
import multer from "multer";

//  create folder if not exists

const ensureDirectoryExists = (folderPath) => {
if(!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath, { recursive: true });
}
}
// Main multer factory function

export const multerFactory=({
    folder = "uploads/",
    mode="single",
  fieldName="file",
  fields=[],
  fileTypes = /jpeg|jpg|png|gif|mp4|mov/, // ✅ fixed regex
  mimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ],
  fileSizeLimitMb = 10, // 10 MB,
  maxCount=5,// if media in array

})=>{
    
    ensureDirectoryExists(folder);

    const storage=multer.diskStorage(
        {
        destination:(req,file,cb)=>
        {
            cb(null,folder)
        },
        filename:(req,file,cb)=>{
            const ext=path.extname(file.originalname).toLowerCase()
            const uniqueName=`${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`
            cb(null,uniqueName)
        },
    })
    // validate both mime and extensiin
    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (fileTypes.test(ext) && mimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Invalid file upload: extension "${ext}", mimetype "${file.mimetype}"`,
            ),
            false,
          );
        }
      };

    const upload=multer({
        storage,fileFilter,limits:{
            fileSize:fileSizeLimitMb *1024*1024,
        },
    })

    if(mode==="single") {return upload.single(fieldName)}
        if(mode==="fields"){ return upload.fields(fields)}
        if(mode==="array") {return upload.array(fieldName,maxCount)}
            if(mode==="none") {return upload.none()}

                throw new Error("Invalid upload mode")

}