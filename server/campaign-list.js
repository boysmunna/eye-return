// Export...
module.exports = campaignList;

function campaignList(req, res) {
    res.json({
        campaigns: getCampaigns()
    });
}

function getCampaigns(){
    return [
        { id: 0, name: 'Red' },
        { id: 1, name: 'Green' },
        { id: 2, name: 'Blue' },
        { id: 3, name: 'Yellow' },
        { id: 4, name: 'Purple' },
        { id: 5, name: 'Orange' },
    ];
}
