const pool=require('../db/pool')
const bcrypt=require('bcrypt');


const normalizeEmail=email =>email.trim().toLowerCase();

module.exports=async(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        return res.status(400).json({error:'email and password required'})
    }
    const normalized=normalizeEmail(email);
    const hash=await bcrypt.hash(password,10);

    try{
        const result=await pool.query(
            `INSERT INTO users (email,password_hash) VALUES ($1,$2) RETURNING id,email`,[normalized,hash]
        )
        res.status(201).json(result.rows[0])
    }catch(err){
        if(err.code==='23505'){
            return res.status(409).json({error:'email already exists'})
        }
        console.log('DB error',err);
        return res.status(500).json({error:'register failed'})
    }
}