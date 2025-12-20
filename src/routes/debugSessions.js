const pool=require('../db/pool');
const logger=require('../middleware/logger');

module.exports=async(req,res,next)=>{
    try{
        const result=await pool.query(
            `SELECT user_id,created_at,expires_at FROM active_sessions WHERE expires_at>NOW() ORDER BY created_at DESC`
        )
        logger.info({
            traceId:req.traceId,
            sessionCount:result.rows.length
        },'debug sessions listed')
        res.json(result.rows);
    }catch(err){
        logger.error({err,traceId:req.traceId},'debug sessions failed');
        res.status(500).json({error:'debug sessions failed'})
    }
}