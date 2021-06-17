module.exports = {
    addPerson, 
    removePerson,
    addPersonLink,
    removePersonLink
}
const titleCase = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
    
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);    
        
    }
    // Directly return the joined string
    return splitStr.join(' '); 
}

async function addPerson(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result; 
        let id;
        result = await conn.execute(`select max(id) from celebrities`)
        if(result.rows[0] === null){
            id = 1;
        }
        else{
            id = result.rows[0][0] + 1;
        }
        result = await conn.execute(
            `insert into Person values (:id, :name, :gender,)`
        )
        if(data.type === 'celebrity'){
            result = await conn.execute(
                `insert into celebrities values (:id, :name, :born, :gender, :biography, :popularity
                    ,:department, :image)`, [id, data.name, data.birthdate, data.gender, data.biography,
                    data.popularity, data.department, data.image]
            )
        }
        else{
            result = await conn.execute(`select max(id) from crew_members`)
            if(result.rows[0] === null){
                id = 1;
            }
            else{
                id = result.rows[0][0] + 1;
            }
            result = await conn.execute(
                `insert into crew_members values (:id, :name, :department, :job, :gender, :popularity)`
                ,[id, data.name, data.department, data.job, data.gender, data.popularity]
            )
        }
        
        res.status(200).json('added successfully'); 

    } catch (err) {
        res.status(400).json('error adding data');
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
        if(data.type  === 'celebrity'){
            result = await conn.execute(
                `delete from Cast 
                where content_id = :content_id and celebrities_id = :member_id`, 
                [data.content_id, data.member_id]
            )
        }

        else if (data.type === 'Crew_Member'){
            result = await conn.execute(
                `delete from Credits
                where content_id = :content_id and Crew_Members_id = :member_id`, 
                [data.content_id, data.member_id]
            )    
        }
        
        res.status(200).json("deleted successfully"); 

    } catch (err) {
        res.status(400).json('error adding data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function addPersonLink(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result; 
        if(data.type  === 'Cast Members'){
            result = await conn.execute(
                `Insert into Cast values (:content_id, :cast_member_id, :orderno, :character)`, [data.content_id, data.member.ID, data.member.order, data.member.character]
            )
        }

        else if (data.type === 'Crew Members'){
            data.member.NAME = titleCase(data.member.NAME);
            data.member.ROLE = titleCase(data.member.ROLE);
            result = await conn.execute(
                `select name, role from crew_members where name = :name and role = :role`, [data.member.NAME, data.member.ROLE]
            )
            if(result.rows.length === 0){
                result = await conn.execute(
                    `insert into crew_members values (:name, :role)`, [data.member.NAME, data.member.ROLE]
                )     
            }
            result = await conn.execute(
                `insert into credits values (:contentid, :name, :role)`, [data.content_id, data.member.NAME, data.member.ROLE]
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
async function removePersonLink(req, res, pool) {
    
    let conn;
    const data = req.body;

    try {
        conn = await pool.getConnection();
        let result; 
        if(data.type  === 'Cast Members'){
            result = await conn.execute(
                `delete from Cast 
                where content_id = :content_id and celebrities_id = :member_id`, 
                [data.content_id, data.member.CELEBRITIES_ID]
            )
        }

        else if (data.type === 'Crew Members'){
            result = await conn.execute(
                `delete from Credits
                where content_id = :content_id and crew_members_name = :name and crew_members_role = :role`, 
                [data.content_id, data.member.NAME, data.member.ROLE]
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

async function editPerson(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result; 
        if(data.type  === 'celebrity'){
            result = await conn.execute(
                `update celebrities
                set name = :name, birthdate = :birthdate, gender = :gender, biography = :biography,
                popularity = :popularity, department = :department, image = :image 
                where id = :id`, 
                [data.name, data.birthdate, data.gender, data.biography, data.popularity, data.department, data.image, data.id]
            )
        }
        else {
            result = await conn.execute(
                `update crew_members
                set name = :name, department = :department, job = :job, gender = :gender, popularity = :popularity
                where id = :id` 
                [data.name, data.department, data.job, data.gender, data.popularity, data.id]
            )    
        }
        
        res.status(200).json("deleted successfully"); 

    } catch (err) {
        res.status(400).json('error adding data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}