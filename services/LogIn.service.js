const LogInRepository = require("../repositories/LogIn.repository")

const LogInService = ()=>({
    login : async(userDetails)=>{
        try{
            const result = await LogInRepository().login(userDetails);
            return(result);
        }
        catch(err){
            throw err
        }
    }
})
module.exports = LogInService