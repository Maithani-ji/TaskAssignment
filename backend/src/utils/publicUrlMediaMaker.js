export const getFullMedaUrl=(req)=>{
    if( !req.files || req.files===0) {return []}

    const baseUrl=`${req.protocol}://${req.get("host")}`
    return req.files.map((file)=>{
        const filePath=file.path.replace(/\\/g,"/")
        return `${baseUrl}/${filePath}`
    })
}