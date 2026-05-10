export const authorizeAdmin = (req, res, next) => {
    // 1. Check 'member' 
    if (!req.session || !req.session.member) {
        return res.status(302).redirect('/api/auth/login'); // Fixed Path
    }

    // 2. Check the flag
    if (!req.session.member.isAdmin) {
        // If they are a user but not an admin, send them home
        return res.status(403).redirect('/home'); 
    }

    next();
};