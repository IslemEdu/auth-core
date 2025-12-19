const express=require('express');
const register=require('./routes/register')
const login=require('./routes/login')
const me=require('./routes/me')
const logout=require('./routes/logout')
const pool=require('./db/pool')
const authenticate=require('./middleware/authenticate')
const {requestLogger}=require('./middleware/logger')
const app=express();
const {checkDB,checkSessions,CheckRateLimit, checkRateLimit}=require('./health')

app.use(requestLogger);
app.use(express.json());

app.post('/register',register);
app.post('/login',login);
app.get('/me',authenticate,me);
app.post('/logout',authenticate,logout)



app.get('/health',async(req,res)=>{
    const [db,sessions,rateLimit]=await Promise.all([
        checkDB(),
        checkSessions(),
        Promise.resolve(checkRateLimit())
    ]);

    const status=db.ok && sessions.ok && rateLimit.ok ? 'ok' : 'degraded'
    const code=status==='ok'?200:503;
    res.status(code).json({
        status,
        timestamp:new Date().toISOString(),
        db,
        sessions,rateLimit
    })

})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Running on http://localhost:${PORT}`);
});