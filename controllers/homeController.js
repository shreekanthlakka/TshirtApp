
const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise( async (req,res) => {
        res.status(200).json({
                success:true,
                greeting:"hello from API"
        });
});


exports.homeDummy = BigPromise( async(req,res) => {
        res.status(200).json({
                success:true,
                greeting:"hello from API which is Dummy route"
        });
});