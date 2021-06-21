const OracleDB = require("oracledb");

module.exports = {
    addCelebrity, 
    removeCelebrity,
    addPersonLink,
    removePersonLink,
    editCelebrity,
    addCelebrityPicture,
    removeCelebrityPicture,
    getCelebrity
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

async function addCelebrity(req, res, pool) {
    
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
            `insert into celebrities values (:id, :name, :born, :gender, :biography, :popularity
                ,:department, :image)`, [id, data.name, data.birthdate, data.gender, data.biography,
                data.popularity, data.department, data.image]
        )

        console.log(result);
        res.status(200).json(id); 

    } catch (err) {
        res.status(400).json('error adding data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function removeCelebrity(req, res, pool) {
    
    let conn;
    const data = req.body;
  
    try {
        conn = await pool.getConnection();
        let result; 
        result = await conn.execute(
            `delete from celebrities
            where id = :id`, 
            [data.id]
        )
    
        res.status(200).json("deleted successfully"); 

    } catch (err) {
        res.status(400).json('error deleting data');
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
                `select id from crew_members where name = :name and role = :role`, [data.member.NAME, data.member.ROLE]
            )
            let id;
            if(result.rows.length === 0){
                
                result = await conn.execute(
                    `select max(id) from crew_members`
                )
    
                if(result.rows[0][0] === null){
                    id = 1;
                }
                else{
                    id = result.rows[0][0] + 1;
                }

                result = await conn.execute(
                    `insert into crew_members values (:id, :name, :role)`, [id, data.member.NAME, data.member.ROLE]
                ) 

            }
            else{
                id = result.rows[0][0]
            }
            result = await conn.execute(
                `insert into credits values (:contentid, :id)`, [data.content_id, id]
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
                `select id from crew_members where name = :name and role = :role`, [data.member.NAME, data.member.ROLE]
            )
            result = await conn.execute(
                `delete from Credits
                where content_id = :content_id and crew_members_id =`, 
                [data.content_id, id]
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

async function editCelebrity(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result; 
            result = await conn.execute(
            `update celebrities
            set name = :name, birthdate = :birthdate, gender = :gender, biography = :biography,
            popularity = :popularity, department = :department, image = :image 
            where id = :id`, 
            [data.name, data.birthdate, data.gender, data.biography, data.popularity, data.department, data.image, data.id]
        )

        
        res.status(200).json("edited successfully"); 

    } catch (err) {
        res.status(400).json('error editing data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function getCelebrity(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result = await conn.execute(
            `select * from celebrities where id = :id`, [data.id], {outFormat: OracleDB.OUT_FORMAT_OBJECT}
        )
        
        let pictures = await conn.execute(
            `select link as NAME from celeb_pics where celebrities_id = :id`, [data.id], {outFormat: OracleDB.OUT_FORMAT_OBJECT}
        )

        if(result.rows.length === 0){
            res.status(404).json("no celebrity found with this id");
        }
        else{
            result.rows[0]["added_pictures"] = pictures.rows;
            res.status(200).json(result.rows[0]); 
        }

    } catch (err) {
        res.status(400).json('error fectching celebrity data');
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function addCelebrityPicture(req, res, pool) {
    
    let conn;
    const data = req.body;
    data["value"] = titleCase(data.value);
    try {       
        conn = await pool.getConnection();
        let result; 
        result = await conn.execute(
            `insert into celeb_pics values (:link, :celeb_id)`, [data.value, data.celeb_id]
        )
        
        console.log(result);
    
        res.status(200).json('successfully added data');

    } catch (err) {
        res.status(400).json('err adding');
        console.log('Ouch!', err)
    } finally {
        if (conn) { // conn assignment worked, need to close
            await conn.close()
        }
    }
}
async function removeCelebrityPicture(req, res, pool) {
    let conn;
    const data = req.body;
    data["value"] = titleCase(data.value);
    try {
        conn = await pool.getConnection();
        let result; 
        result = await conn.execute(
            `delete from celeb_pics where link = :link and celebrities_id = :celebid`, [data.value, data.celeb_id]
        )

    
        res.status(200).json('successfully removed link');

    } catch (err) {
        res.status(400).json('err removing picture');
        console.log('Ouch!', err)
    } finally {
        if (conn) { // conn assignment worked, need to close
            await conn.close()
        }
    }
}

