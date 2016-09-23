// Memoized:
var getData = (function(){
    var previousData = {};
    return function getData(num,cid){
        var getter = cid + "::" + num;
        return (previousData[getter] = previousData[getter] || generateData(num));
    };
})();

// Export...
module.exports = campaignData;

function campaignData(req, res) {
    var num = req.query.number;
    var cid = req.params.cid;

    var error = getInputValidationError(num, cid);
    if(error){
        res.status(error.code).json(error);
    }
    else {
        res.json(getData(+num, cid));
    }
}

function generateData(num){
    var imps = buildImpressions(num);
    var ctr = 0.0025 + (Math.random() * Math.random() * 0.2 );
    var clicks = imps * ctr;
    var users = imps * (0.625 + (Math.random() / 0.333));
    return {
        impressions: Math.ceil(imps),
        clicks: Math.floor(clicks),
        users: Math.floor(users)
    };
}

/*
 * Plotted:  http://www.wolframalpha.com/input/?i=plot++100+*+%28cbrt%28x%2F4%29+%2B+cos%28sqrt%28x+*+1.25%29+%2B+sin%28x+*+0.2%29%29%29+from+x%3D0+to+x%3D200
*/
function buildImpressions(num){
    var magnitude = 1000;
    var growthAddition = Math.pow(Math.abs(num / 4), 1/3);
    var curveBall = Math.cos(Math.sqrt(num * 1.25) + Math.sin(num / 5));

    return magnitude * (growthAddition + curveBall);
}

function getInputValidationError(num, cid){
    if([0,1,2,3,4,5].indexOf(+cid) === -1){
        return { code: 404, message: "Campaign '"+cid+"' not found."};
    }

    if(num == null){
        return { code: 404, message: "Missing 'number' query parameter."};
    }

    num = +num;
    if(isNaN(num) || !(isFinite(num) && (num >= 0))){
        return { code: 404, message: "Invalid 'number' query parameter."};
    }
}
