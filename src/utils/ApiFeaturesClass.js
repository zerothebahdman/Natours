class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    console.log(queryObj);
    const excludeKeyWords = ['sort', 'page', 'limit', 'fields'];
    excludeKeyWords.forEach((element) => delete queryObj[element]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    console.log(queryStr);
    console.log('------------------------');
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(queryStr);
    console.log('------------------------');
    this.query = this.query.find(JSON.parse(queryStr));
    console.log(queryStr);
    console.log('------------------------');

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-created_at');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
