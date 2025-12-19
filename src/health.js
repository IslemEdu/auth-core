const pool=require('./db/pool');

exports.checkDB=async()=>{
    const start=Date.now();
    try{
        await pool.query('SELECT 1');
        return {
            ok:true,
            latency_ms:Date.now()-start,
            message:'connected'
        }
    }catch(err){
        return {
            ok:false,
            error:err.message,
            message:'DB unreachable'
        }
    }
}

exports.checkSessions=async()=>{
    try{
        const result=await pool.query(
            `SELECT COUNT(*) FROM active_sessions WHERE expires_at>NOW()`
        );
        return {
            ok:true,
            active:parseInt(result.rows[0].count),
            message:'sessions healthy'
        }
    }catch(err){
        return{
            ok: false,
            error: err.message,
            message: 'session check failed'
        }
    }
}

exports.checkRateLimit = () => {
  return {
    ok: true,
    count: global.loginAttempts?.size || 0,
    message: 'rate limit healthy'
  };
};