const oracledb = require('oracledb');
module.exports = {
    addElement,
    removeElement,
    addTVDetail,
    removeTVDetail
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


async function addElement(req, res, pool) {
    
    let conn;
    const data = req.body;
    if(data.type !== 'Pictures'){
        data["value"] = titleCase(data.value);
    }

    try {
        conn = await pool.getConnection();
        let result; 
        let id;
        switch(data.type){
            case 'Genres':
                result = await conn.execute(
                    `select id from genres where name = :name`, [data.value]
                )
                if(result.rows.length === 0){
                    result = await conn.execute(
                        `select max(id) from genres` 
                    )
                    if(result.rows[0][0] === null){
                        id = 1;
                    }
                    else{
                        id = result.rows[0][0] + 1;
                    }
                    
                    result = await conn.execute(
                        `insert into genres values (:id, :name)`
                        ,[id, data.value]
                    )
                }
                else{
                    id = result.rows[0][0];
                }

                result = await conn.execute(
                    `insert into content_genres values (:contentid, :genreid)`
                    ,[data.content_id, id]
                )
                break;

    //--------------------------------------------------------------------------------------------
            case 'Languages':
                result = await conn.execute(
                    `select id from languages where name = :name`, [data.value]
                )
                if(result.rows.length === 0){
                    result = await conn.execute(
                        `select max(id) from languages` 
                    )
                    if(result.rows[0][0] === null){
                        id = 1;
                    }
                    else{
                        id = result.rows[0][0] + 1;
                    }
                    
                    result = await conn.execute(
                        `insert into languages values (:id, :name)`
                        ,[id, data.value]
                    )
                }
                else{
                    id = result.rows[0][0];
                }

                result = await conn.execute(
                    `insert into Spoken_Languages values (:contentid, :languageid)`
                    ,[data.content_id, id]
                )
                break;

        //--------------------------------------------------------------------------------------------
            case 'Filming Locations':

                result = await conn.execute(
                    `select id from locations where name = :name`, [data.value]
                )

                if(result.rows.length === 0){
                    result = await conn.execute(
                        `select max(id) from locations` 
                    )
                    if(result.rows[0][0] === null){
                        id = 1;
                    }
                    else{
                        id = result.rows[0][0] + 1;
                    }

                    result = await conn.execute(
                        `insert into locations values (:id, :name)`
                        ,[id, data.value]
                    )

                }
                else{
                    id = result.rows[0][0];
                }

                
                result = await conn.execute(
                    `insert into Filming_Locations values (:contentid, :locationid)`
                    ,[data.content_id, id]
                )

                break;

    //--------------------------------------------------------------------------------------------
        case 'Production Companies':
            result = await conn.execute(
                `select id from production_co where name = :name`, [data.value]
            )
            if(result.rows.length === 0){
                result = await conn.execute(
                    `select max(id) from production_co` 
                )
                if(result.rows[0][0] === null){
                    id = 1;
                }
                else{
                    id = result.rows[0][0] + 1;
                }
                
                result = await conn.execute(
                    `insert into production_co values (:id, :name)`
                    ,[id, data.value]
                )
            }
            else{
                id = result.rows[0][0];
            }

            result = await conn.execute(
                `insert into produced_by values (:contentid, :production_coid)`
                ,[data.content_id, id]
            )
            break;
        //--------------------------------------------------------------------------------------------
        case 'Plot Keywords':
            result = await conn.execute(
                `select id from plot_keywords where name = :name`, [data.value]
            )
            if(result.rows.length === 0){
                result = await conn.execute(
                    `select max(id) from plot_keywords` 
                )
                if(result.rows[0][0] === null){
                    id = 1;
                }
                else{
                    id = result.rows[0][0] + 1;
                }
                
                result = await conn.execute(
                    `insert into plot_keywords values (:id, :name)`
                    ,[id, data.value]
                )
            }
            else{
                id = result.rows[0][0];
            }

            result = await conn.execute(
                `insert into plots values (:contentid, :plot_keywordid)`
                ,[data.content_id, id]
            )
            break;

        case 'Pictures':
            result = await conn.execute(
                `select type from content where id = :id`, [data.content_id]
            )
            let content_type = result.rows[0][0];

            if(content_type === 'movie'){
                result = await conn.execute(
                    `insert into movie_pics values (:link, :movie_id)`, [data.value, data.content_id]
                )
            }
            else{
                result = await conn.execute(
                    `insert into tv_pics values (:link, :tv_id)`, [data.value, data.content_id]
                )
            }
            break;

        }
    
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

async function removeElement(req, res, pool) {
    let conn;
    let id;
    const data = req.body;
    let value;
    if(data.type === 'Pictures'){
        value = data.object.LINK;
    }
    else{
        value = titleCase(data.object.NAME);
    }
    data.value = value;

    try {
        conn = await pool.getConnection();
        let result; 
        switch(data.type){
            case 'Genres':
                result = await conn.execute(
                    `select id from genres where name = :name`, [data.value]
                )
                id = result.rows[0][0];
                result = await conn.execute(
                    `delete from content_genres where content_id = :contentid and genres_id = :genreid`, [data.content_id, id]
                )
                console.log(result);
                break;

    //--------------------------------------------------------------------------------------------
            case 'Languages':
                
                result = await conn.execute(
                    `select id from languages where name = :name`, [data.value]
                )
                id = result.rows[0][0];
                result = await conn.execute(
                    `delete from spoken_languages where content_id = :contentid and languages_id = :languageid`, [data.content_id, id]
                )
                break;

        //--------------------------------------------------------------------------------------------
            case 'Filming Locations':

                result = await conn.execute(
                    `select id from locations where name = :name`, [data.value]
                )

                id = result.rows[0][0];
                result = await conn.execute(
                    `delete from filming_locations where content_id = :contentid and locations_id = :locationid`, [data.content_id, id]
                )

                console.log(result);
                break;

    //--------------------------------------------------------------------------------------------
            case 'Production Companies':
                result = await conn.execute(
                    `select id from production_co where name = :name`, [data.value]
                )
                id = result.rows[0][0];
                result = await conn.execute(
                    `delete from produced_by where content_id = :contentid and production_co_id = :productioncoid`, [data.content_id, id]
                )
            
                console.log(result)
                break;
        //--------------------------------------------------------------------------------------------
            case 'Plot Keywords':
                result = await conn.execute(
                    `select id from plot_keywords where name = :name`, [data.value]
                )
                id = result.rows[0][0];
                result = await conn.execute(
                    `delete from plots where content_id = :contentid and plot_keywords_id = :plotkeyid`, [data.content_id, id]
                )

                console.log(result)
                break;
            
            case 'Pictures':
                result = await conn.execute(
                    `select type from content where id = :id`, [data.content_id]
                )
                console.log(result.rows[0][0])

                let content_type = result.rows[0][0];
                
                if(content_type === 'movie'){
                    result = await conn.execute(
                        `delete from movie_pics where link = :link and movies_movieid = :movieid`, [data.value, data.content_id]
                    )
                }
                else{
                    result = await conn.execute(
                        `delete from tv_pics where link = :link and tv_shows_tvid = :tvid`, [data.value, data.content_id]
                    )
                }

                console.log(result)
                break;

        }
        
        res.status(200).json('successfully deleted');

    } catch (err) {
        res.status(400).json('error deleting')
        console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}


async function addTVDetail(req, res, pool) {

    let conn;

    let data  = req.body;
    try {
      
      conn = await pool.getConnection();
      let result;
      if(data.type === 'Seasons'){
        result = await conn.execute(
            `insert into seasons values (:season_no, :airdate, :episodes, :overview, :image, :tvid)`,
            [data.object.SEASON_NO, data.object.AIRDATE, data.object.EPISODES, data.object.OVERVIEW, data.object.IMAGE, data.content_id]
          );
          
        console.log(result);
      }
      
      else{
        let id;
        result = await conn.execute(
            `select id from creators where name = :name and gender = :gender`,
            [data.object.NAME, data.object.GENDER]
        )

        if(result.rows.length === 0){
            
            result = await conn.execute(
                `select max(id) from creators`,
            );
            console.log(result);
            if(result.rows[0][0] === null){
                id = 1;
            }
            else{
                id = result.rows[0][0] + 1;
            }

            result = await conn.execute(
                `insert into creators values (:id, :name, :gender)`,
                [id, data.object.NAME, data.object.GENDER]
            )

        }
        else{
            id = result.rows[0][0];
        }
        result = await conn.execute(
            'insert into created_by values (:tvid, :creator_id)',
            [data.content_id, id]
        )

        console.log(result);
      }

      
    } catch (err) {
      console.log('Ouch!', err)
    } finally {
      if (conn) { // conn assignment worked, need to close
        
        await conn.close()
      }
    
    }

}

async function removeTVDetail(req, res, pool) {

    let conn;

    let data  = req.body;
    try {
      
      conn = await pool.getConnection();
      let result;
      if(data.type === 'Seasons'){
        result = await conn.execute(
            `delete from seasons where season_no = :seasonno and tv_shows_tvid = :tvid`,
            [data.object.SEASON_NO, data.content_id]
        );
        console.log(result);
      }
      else{
        result = await conn.execute(
            `select id from creators where name = :name and gender = :gender`,
            [data.object.NAME, data.object.GENDER]
        )
        let creator_id = result.rows[0][0];

        result = await conn.execute(
            `delete from created_by where tv_shows_id = :tvid and creators_id = :creatorid`,
            [data.content_id, creator_id]
        );
        console.log(result);       
      }
     
      
      
    } catch (err) {
      console.log('Ouch!', err)
    } finally {
      if (conn) { // conn assignment worked, need to close
        
        await conn.close()
      }
    
    }

}