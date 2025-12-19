const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../db/pool');
const logger=require('../middleware/logger')

const normalizeEmail = email => email.trim().toLowerCase();

const loginAttempts=new Map();
global.loginAttempts=loginAttempts;
const MAX_ATTEMPTS=5;
const WINDOW_MS=15*60*1000

module.exports=async(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        return res.status(400).json({error:'email and password required'})
    }
    const normalized=email.trim().toLowerCase();
    const now=Date.now();

    let attempts=loginAttempts.get(normalized);

    if(!attempts||now>attempts.reset){
        attempts={count:0,reset:now+WINDOW_MS};
        loginAttempts.set(normalized,attempts);
    }
    if(attempts.count>MAX_ATTEMPTS){
        const retryAfter=Math.ceil((attempts.reset-now)/1000);
        return res.status(429).json({error:'too many attempts',retryAfter});
    }

    try{
        const userResult=await pool.query(
            'SELECT id,password_hash FROM users WHERE email=$1',[normalized]
        );
        let isValid=false;

        if(userResult.rows.length>0){
            const user=userResult.rows[0];
            isValid=await bcrypt.compare(password,user.password_hash)
        }else{
            await bcrypt.compare(password,'$2b$10$dummyhashdummyhashdummyha')
        }
        if(isValid){
            loginAttempts.delete(normalized);
            const token=crypto.randomBytes(32).toString('hex');
            await pool.query(
                `INSERT INTO active_sessions (user_id,token,expires_at) VALUES ($1,$2,NOW()+INTERVAL '7 days')`,[userResult.rows[0].id,token]
            );
            return res.status(200).json({token})
        }else{
            attempts.count +=1;
            loginAttempts.set(normalized,attempts);
            return res.status(401).json({error:'Invalid credentials'})
        }
    }catch(err){
        logger.error('Login error:', err);
        return res.status(500).json({ error: 'login failed' });
    }
}