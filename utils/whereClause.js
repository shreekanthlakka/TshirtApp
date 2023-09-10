
//api/v1/testproduct?search=sreekanth&page=2 &category=shortsleeves &ratings[gte]=4&price[lte]=999&price[gte]=199
// {
//         search: 'sreekanth',
//         page: '2',
//         category: 'shortsleeves',
//         ratings: { gte: '4' },
//         price: { lte: '999', gte: '199' }
// }      


//base------->> Product.find()
//bigQ ------>>> search=sreekanth&page=2 &category=shortsleeves &ratings[gte]=4&price[lte]=999&price[gte]=199 &limit=2

class WhereClause{
        constructor(base,bigQ){
                this.base = base;
                this.bigQ = bigQ;
        }

        search(){
                const searchword = this.bigQ.search ? {
                        name : {
                                $regex : this.bigQ.search,
                                $options: 'i'
                        }
                } : {}

                this.base = this.base.find({...searchword})
                // console.log(`this value in search method of WhereClause ------ ${this.base}`);
                return this;
        }

        filter(){
                const copyQ = { ...this.bigQ }

                // console.log("------copyQ before deleting search limit and page-----");
                // console.log(JSON.stringify(copyQ));

                delete copyQ["search"];
                delete copyQ["limit"];
                delete copyQ["page"];

                // console.log("------copyQ after deleting search limit and page------");
                // console.log(JSON.stringify(copyQ));

                //convert BigQ into string

                let stringOfCopyQ = JSON.stringify(copyQ)

                stringOfCopyQ = stringOfCopyQ.replace( /\b(gte|lte)\b/g, m => `$${m}`)

                const jsonOfCopyQ = JSON.parse(stringOfCopyQ)

                // console.log("---------json of copy Q ======");
                // console.log(JSON.stringify(jsonOfCopyQ));


                this.base = this.base.find(jsonOfCopyQ);
                return this;
        }

        pager(resultperpage){
                let currentPage = 1;
                if(this.bigQ.page){
                        currentPage = this.bigQ.page
                }

                const skipVal = resultperpage *(currentPage - 1);
                this.base = this.base.limit(resultperpage).skip(skipVal);
                return this;
        }

}

module.exports = WhereClause;