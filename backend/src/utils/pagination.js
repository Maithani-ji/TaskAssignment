// Helper methods for skip limit pagination
const parseObject=(item)=>{
    if(item && typeof item==="string")
    {
        try {
           return JSON.parse(item)
        } catch {
            throw new Error(`Invalid JSON for ${item}`)
        }
    }
    return item
}

const buildResponse=(data,filter,totalDocs=data.length,page=1,limit=totalDocs)=>{
    const totalPages=Math.ceil(totalDocs/limit)
    return {
        ...(Object.keys(filter).length && {filter}),
        paginatedData:data,
        paginatedDataCount:data.length,
        pagination:{
            currentPage:page,
            pageSize:limit,
            totalPages,
            totalData:totalDocs,
            hasNextPage:page<totalPages,
            hasPrevPage:page>1,
        },
    }

}

const prepareFilter=(filter)=>{
    const operators = { eq: "$eq", ne: "$ne", gt: "$gt", gte: "$gte", lt: "$lt", lte: "$lte", in: "$in", nin: "$nin", regex: "$regex" };
    const prepared = {};

    for (const [key,value] of Object.entries(filter))
    {
        if(key.includes("__"))
        {
            const [field,operator]=key.split("__")
            if(!operators[operator])
            {
                continue
            }
            prepared[field]={...prepared[field],[operators[operator]]:parseFilterValue(value)}
        }
        else{
            prepared[key]=parseFilterValue(value)
        }
    }
    
    
    return prepared
}


const parseFilterValue = (value) => {
    if (typeof value === "string" && value.includes(",")) {
        return value.split(",").map(tryParse);
    }

    // Detect date strings and convert to Date
    if (typeof value === "string" && isValidDate(value)) {
        return new Date(value);
    }

    return value;
};

const isValidDate = (value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
};

const tryParse=(value)=>{
    const number =Number(value)
    return isNaN(number)?value:number
}
// Skip Limit based pagination (Production-ready) and Its helper function above

export const paginateWithSkipLimit = async (Model, options = {}) => {

    try {
        
        const { page = 1, limit = 10, sort = {}, select = "", populate = {}, filter={} } = options;

        // Safe parse populate and filter
        const  newPopulate = parseObject(populate);
        const  newFilter = parseObject(filter);
        const defaultSort = { createdAt: -1, _id: -1 };
        const newSort =Object.keys(sort).length ? parseObject(sort) : defaultSort;
        
        console.log(newSort);
        
       
        
        // Prepared Filter
        const preparedFilter = prepareFilter(newFilter);
        console.log(preparedFilter);
        const isFetchAll=limit==="all"

        if(isFetchAll)
        {
            const data= await Model.find(preparedFilter).sort(newSort).select(select).populate(Object.keys(newPopulate).length? newPopulate:"").lean().exec()
            return buildResponse(data,newFilter)
        }

        const newPage=Math.max(Number(page)||1,1)
        const newLimit=Math.max(Number(limit)||10,1)

        const skip=(newPage-1)*newLimit

        const [totalDocs,data]=await Promise.all([
            Model.countDocuments(preparedFilter).exec(),
            Model.find(preparedFilter).sort(newSort).skip(skip).limit(limit).select(select).populate(Object.keys(newPopulate).length? newPopulate:"").lean().exec(),
        ])
        return buildResponse(data,newFilter,totalDocs,newPage,newLimit)
    } catch (err) {
        const error=new Error(err.message || "Pagination error")
        error.status=400
        throw error
    }
  
};

// Cursor  based pagination

export const paginateWithCursor=async(Model,query={},options={})=>{
    const {limit=10,sortField="_id",sortOrder=1,cursor=null,select="",populate=""}=options

    const paginationQuery={...query}

    //  if cursor is provided ,add it to query
    if(cursor)
    {
        paginationQuery[sortField]={[sortOrder===1? "$gt" : "$lt"]:cursor}

    }
    // fecth data

    const data= await Model.find(paginationQuery).sort({[sortField]:sortOrder}).limit(limit).select(select).populate(populate).lean().exec()

    // prepeare next cursor from last document or data from the current page
    const nextCursor=data.length? data[data.length-1][sortField]:null;

    return {
        data,
        pagination:{
            
            nextCursor,
            pageSize:limit,
            hasNextPage:Boolean(nextCursor),
        },
    }
}