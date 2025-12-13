const pool=require('../db/pool');

module.exports=async(req,res,next)=>{
     const authHeader=req.headers.authorization;
    if(!authHeader||!authHeader.startsWith('Bearer ')){
        return res.status(401).json({error:'Unauthorized'})
    }
    const token=authHeader.split(' ')[1].trim();
    try{
        const result=await pool.query(
            `SELECT u.id,u.email FROM active_sessions s JOIN users u ON s.user_id=u.id WHERE token=$1 AND expires_at >NOW()`,[token]
        )
        if(result.rows.length===0){
            return res.status(401).json({error:'Unauthorized or invalid token'})
        }
        req.user=result.rows[0]
        req.token=token;
        next();
    }catch(err){
        console.error('Authentication error:', err);
        return res.status(500).json({ error: 'server error' });
    }
}