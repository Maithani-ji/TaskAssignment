import { logger } from "../config/logger.js";

// utils/cascadeDeleteFactory.js
export const createCascadeDeleter = async({ model, dependencies = []}) => {
    logger.info(`Creating cascade deleter for ${model.modelName}`);
    return async (id, session = null) => {
        logger.info(`Cascade delete initiated for ${model.modelName}`);

        const doc = await model.findById(id).session(session);
        if (!doc) {
            const error = new Error(`${model.modelName} not found`);
            error.status = 404;
            throw error;
        }
        console.log(doc);
        
        // Delete dependencies first
        for (const dependency of dependencies) {
            const result = await dependency.model.deleteMany({ [dependency.field]: id }).session(session);
            logger.info(`Deleted ${result.deletedCount} ${dependency.model.modelName} for ${dependency.field}: ${id}`);
            console.log(result);
            
        }

        // Delete main document
        await model.deleteOne({ _id: id }).session(session);
        logger.info(`${model.modelName} deleted with dependencies`);

        return doc;
    };
};
