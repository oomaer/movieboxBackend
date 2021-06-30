
module.exports = {
    registerUser,
    signInUser,
    editUser
} 

const bcrypt = require('bcrypt');
const e = require('cors');
const saltRounds = 10;

async function registerUser(req, res, pool) {
    
    let conn;
    try {
    let data = req.body
    const hash = bcrypt.hashSync(data.password, saltRounds);
    conn = await pool.getConnection();
    let result = await conn.execute(
        `insert into users values (:name, :email, :password)`,
        [data.name, data.email, hash]
    );
    
    if(result.rowsAffected === 1){
        res.sendStatus(200);
    }
    
    } catch (err) {
        if(err.message === `ORA-00001: unique constraint (TESTMOVIE.USER_PK) violated`){
            res.status(400).json("email already entered");
        }
        else{
            res.status(400).json("registration failed");
        }
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}
async function signInUser(req, res, pool) {
    let conn;

    try {
    let data = req.body;
    
    conn = await pool.getConnection();
    let result = await conn.execute(
        `select * from users where email = :email`,
        [data.email]
    );

    if(result.rows.length === 0){
        res.status(401).json("account not found");
    }
    else{
        bcrypt.compare(data.password, result.rows[0][2], function(err, valid) {
            if(valid){
                let admin;
                if(result.rows[0][1].split('@')[1] === 'admin.db'){
                    console.log('here');
                    admin = true;
                }
                else{
                    admin = false;
                }
                res.json({name: result.rows[0][0], email: result.rows[0][1], admin: admin});
            }
            else{
                res.status(401).json("wrong password");
            }
        });
        
    }
    
    } catch (err) {
        res.status(400).json("authentication error");
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function editUser(req, res, pool) {
    let conn;

    try {
    console.log(req.body)
    let data = req.body;
    console.log(data);
    conn = await pool.getConnection();
    
    let result = await conn.execute(
        `select password from users where email = :email`,
        [data.current_email]
    );
    if(bcrypt.compareSync(data.confirmpass, result.rows[0][0])){
        if(!data.password.new){
            console.log('not pass change');
            await conn.execute(
                `UPDATE users 
                SET name = :name, email = :email, password = :password
                where email = :currentmail`, 
                {
                    name: {val: data.name},
                    email: {val: data.email},
                    password: {val: result.rows[0][0]},
                    currentmail: {val: data.current_email}
                }
            );
        }
        else{
            console.log('new passs');
            const hash = bcrypt.hashSync(data.password.value, saltRounds);
            await conn.execute(
                `update users
                set name = :name, email = :email, password = :hash
                where email = :currentemail`, 
                [data.name, data.email, hash, data.current_email],
            );
        }
        res.status(200).json('success');
        console.log('success');
    }
    else{

        res.status(401).json("wrong password");
    }   
    
    } catch (err) {
        if(err.message === `ORA-00001: unique constraint (TESTMOVIE.USER_PK) violated`){
            res.status(400).json("email already entered");
        }
        else{
            res.status(400).json("update error");
        }
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}