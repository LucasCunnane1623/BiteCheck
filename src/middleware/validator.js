

export const validateLocation = (req, res, next) => {
    const { lat, lng, dist } = req.query;
    if (lat === undefined || lng == undefined){
        return res.status(400).json({ error: "Latitute and longitude are required"})
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const distNum = parseInt(dist) || 500;

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180){
        return res.status(400).json({ error: "Invalid coordinates provided"});
    } 

    if (distNum < 0 || distNum > 50000){
        return res.status(400).json({ error: "Distance must be between 0 and 50 kms"})
    }

    req.coords = { lat: latNum, lng: lngNum, dist: distNum}
    next();
};
