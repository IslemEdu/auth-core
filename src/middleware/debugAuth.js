const logger=require('../middleware/logger');

module.exports=(req,res,next)=>{
    const token=req.headers['x-debug-token'];

    if(!token){
        logger.warn({traceId:req.traceId},'debug access denied:missing token')
        return res.status(401).json({error:'debug access denied'})
    }
    if(token !==process.env.DEBUG_TOKEN){
        logger.warn({ traceId: req.traceId }, 'debug access denied: invalid token');
        return res.status(403).json({ error: 'debug access denied' });
    }
    next()
}