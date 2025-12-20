const pool=require('./db/pool');

exports.cleanupExpiredSessions=async()=>{
    try{
        const start=Date.now();
        const result=await pool.query(
            'DELETE FROM active_sessions WHERE expires_at <NOW()'
        );
        return {
            ok:true,
            deleted:result.rowCount,
            latency_ms:Date.now()-start,
            message:`Cleaned ${result.rowCount} expired sessions`
        }
    }catch(err){
        return {
            ok:false,
            error:err.message,
            message:'sessions cleanup failed'
        }
    }
}