import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import postRoutes from "./postRoutes.js";
import restaurantRoutes from "./restaurantRoutes.js";
import userRoutes from "./userRoutes.js";
import landingRoutes from "./landingRoutes.js";

const constructorMethod = (app) =>{
    app.use('/home',landingRoutes);
    app.use("/api/auth",authRoutes); // add all of the other routes 
    app.use((req,res)=>{
        return res.redirect('/home');
        // return res.status(404).render("error",
        //     {
        //         error:'Route Not Found'
        //     }
        // ) 
    });
}

export default constructorMethod 