const express=require('express');
const register=require('./routes/register')
const login=require('./routes/login')
const me=require('./routes/me')
const logout=require('./routes/logout')
const pool=require('./db/pool')
const authenticate=require('./middleware/authenticate')
const {requestLogger}=require('./middleware/logger')
const app=express();

app.use(requestLogger);
app.use(express.json());

app.post('/register',register);
app.post('/login',login);
app.get('/me',authenticate,me);
app.post('/logout',authenticate,logout)



app.get('/health',async(req,res)=>{
    try{
        const result=await pool.query('SELECT COUNT (*) FROM users');
        const userCount=parseInt(result.rows[0].count,10);
        res.json({status:'ok',userCount})
    }catch(err){
        console.error('Health check DB error:', err);
        res.status(500).json({ status: 'error', message: 'DB unreachable' });
    }
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Running on http://localhost:${PORT}`);
});