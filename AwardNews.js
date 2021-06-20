const oracledb = require('oracledb');
module.exports = {
    addAwardEvent,
    addNews,
    editAwardEvent,
    deleteAwardEvent,
    editNews,
    deleteNews,
    getNews,
    getAwardEvent
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

async function editAwardEvent(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result;
        result = await conn.execute(
            `update awards_events
             set name = :name, year = :year, discription = :discription,
              image = :image, content_id = :content_id
             where id = :id`
            ,[data.name, data.year, data.discription, data.image, data.content.ID, data.id]
        )

        res.status(200).json('successfully edited');

    } catch (err) {
        res.status(400).json('error editing data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function editNews(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result;
        result = await conn.execute(
            `update news
            set name = :name, discription = :discription, publishDate = :publishDate,
             popularity = :popularity, image = :image, content_id = :content_id
             where id = :id`
            ,[data.name, data.discription, data.publishDate, data.popularity, data.image, data.content.ID, data.id]
        )

        
        res.status(200).json('successfully edited');

    } catch (err) {
        res.status(400).json('error editing data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}


async function deleteAwardEvent(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result;
        result = await conn.execute(
            `delete from awards_events where id = :id`
            ,[data.id]
        )

        res.status(200).json('successfully deleted');

    } catch (err) {
        res.status(400).json('error deleting data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function deleteNews(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result;
        result = await conn.execute(
            `delete from news where id = :id`
            ,[data.id]
        )

        res.status(200).json('successfully deleted');

    } catch (err) {
        res.status(400).json('error deleting data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function getNews(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result;
        result = await conn.execute(
            `select * from news where id = :id`
            ,[data.id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        if (result.rows.length === 0){
            res.status(404).json("data not found");
        }
        else{
            let contentdata = await conn.execute(
                `select * from content where id = :id`, [result.rows[0].CONTENT_ID],
                {outFormat: oracledb.OUT_FORMAT_OBJECT}
            )

            result.rows[0].content = contentdata.rows[0];
            res.status(200).json(result.rows[0]);
        }

    } catch (err) {
        res.status(400).json('error fetching news data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function getAwardEvent(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result;
        result = await conn.execute(
            `select * from awards_events where id = :id`
            ,[data.id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        if (result.rows.length === 0){
            res.status(404).json("data not found");
        }
        else{
            let contentdata = await conn.execute(
                `select * from content where id = :id`, [result.rows[0].CONTENT_ID],
                {outFormat: oracledb.OUT_FORMAT_OBJECT}
            )

            result.rows[0].content = contentdata.rows[0];
            res.status(200).json(result.rows[0]);
        }

    } catch (err) {
        res.status(400).json('error fetching news data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}