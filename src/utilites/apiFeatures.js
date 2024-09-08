
export class ApiFeatures {
    constructor(mongooseQuery, query) {
        this.mongooseQuery = mongooseQuery;
        this.query = query;
    }


  

    pagination() {

        const { page = 1, limit = 5 } = this.query
        const skip = (page - 1) * limit

        this.mongooseQuery.skip(skip).limit(limit);
       

        return this;
    }

    sort() {


        this.mongooseQuery.sort(this.query.sort)
        return this;

    }



    filters() {
        const { page = 1, limit = 5, sort, ...filtering } = this.query;
        const feltrString = JSON.stringify(filtering)
        const replaceFilter = feltrString.replaceAll(/lt|gt|lte|gte|eq|ne|regex/g, (ele) => `$${ele}`);
        const parseFiltering = JSON.parse(replaceFilter)

        this.mongooseQuery.find(parseFiltering)

        return this
    }
}