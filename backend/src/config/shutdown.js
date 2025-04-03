import fs from "fs"
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";


// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logDirectory = path.join(__dirname, "../logs")

// Ensure log directory exists and get deleted after ctrl+c
const clearLogs = () => {
    logger.info("Clearing Logs initiating...");
  
    try {
      // Recursively delete log files in directory and subdirectories
      deleteLogFilesRecursively(logDirectory);
    } catch (error) {
      logger.error("Error deleting log files", error);
    }
  };
//    helper method for clearLogs to delete log extension file in nested folders
  const deleteLogFilesRecursively = (directoryPath) => {
    // Read files and subdirectories in the provided directory
    const files = fs.readdirSync(directoryPath);
  
    logger.info(`Found ${files.length} items in directory: ${directoryPath}`);
  
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
  
      // Check if the current item is a directory
      if (fs.statSync(filePath).isDirectory()) {
        // If it's a directory, call the function recursively to go inside it
        logger.info(`Entering directory: ${filePath}`);
        deleteLogFilesRecursively(filePath);
      } else {
        // If it's a file, delete it if it's a log file (based on your condition)
        if (!file.endsWith(".json")) {
          logger.info(`Deleting log file: ${filePath}`);
          fs.unlinkSync(filePath); // Delete the log file
          logger.info(`Deleted log file: ${filePath}`);
        } else {
          logger.info(`Skipping non-log file: ${filePath}`);
        }
      }
    });
  };
  
// shutdown helper method
const gracefulShutDown=async(signal,server,closeDB)=>{

    logger.warn(`${[signal]} recieved. Cleaning Up resources...`)
try{
if(signal==="SIGTERM")
{
clearLogs()
}
await closeDB()
// stop server
server.close(()=>{
  logger.info("Server stopped gracefully")
  process.exit(0)
})
}
catch(err){
logger.error("Error during shutdown:", err)
process.exit(1)
}
}

// method to call shutdown helper
export const setupGracefulShutdown= async(server,closeDB) => {

   
    process.on("SIGINT",()=>gracefulShutDown("SIGINT",server,closeDB)) // Ctrl+C

    process.on("SIGTERM",()=>gracefulShutDown("SIGTERM",server,closeDB))// pm2 or k8 shutdown
}