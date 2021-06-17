module.exports = {
    addPerson, 
    removePerson
}
async function addPerson(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result; 
        if(data.type  === 'Cast Members'){
            result = await conn.execute(
                `Insert into Cast values (:content_id, :cast_member_id, :orderno, :character)`, [data.content_id, data.member_id, data.order, data.character]
            )
        }

        else if (data.type === 'Crew Members'){
            result = await conn.execute(
                `Insert into Credits values (:content_id, :crew_member_id)`, [data.content_id, data.member_id]
            )        
        }
        
        res.status(200).json('added successfully'); 

    } catch (err) {
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}
async function removePerson(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result; 
        if(data.type  === 'Cast Members'){
            result = await conn.execute(
                `delete from Cast 
                where content_id = :content_id and celebrities_id = :member_id`, 
                [data.content_id, data.member_id]
            )
        }

        else if (data.type === 'Crew Members'){
            result = await conn.execute(
                `delete from Credits
                where content_id = :content_id and Crew_Members_id = :member_id`, 
                [data.content_id, data.member_id]
            )    
        }
        
        res.status(200).json("deleted successfully"); 

    } catch (err) {
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}
