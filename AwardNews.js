const oracledb = require('oracledb');
module.exports = {
    addAwardEvent,
    addNews
} 


async function addAwardEvent(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result;
        result = await conn.execute(
            `select max(id) from Awards_Events`
        )    
        let id;
        if(result.rows[0][0] === null){
            id = 1;
        }
        else{
            id = result.rows[0][0] + 1;
        }
        result = await conn.execute(
            `insert into Awards_Events values (:id, :name, :year, :discription, :image, :content_id)`
            ,[id, data.name, data.year, data.discription, data.image, data.content.ID]
        )

        res.status(200).json('successfully added');

    } catch (err) {
        res.status(400).json('error adding data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function addNews(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result;
        result = await conn.execute(
            `select max(id) from News`
        )    
        let id;
        if(result.rows[0][0] === null){
            id = 1;
        }
        else{
            id = result.rows[0][0] + 1;
        }
        result = await conn.execute(
            `insert into News values (:id, :name, :discription, :publishDate, :popularity, :image, :content_id)`
            ,[id, data.name, data.discription, data.publishDate, data.popularity, data.image, data.content.ID]
        )
        
        res.status(200).json('successfully added');

    } catch (err) {
        res.status(400).json('error adding data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}