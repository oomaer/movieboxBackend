const oracledb = require('oracledb');
module.exports = {
    getRecommended,
    addContent,
    search,
    getContentDetails,
    getContentData,
    editContentData,
    deleteContentData
} 


async function getRecommended(req, res, pool) {
    
    let conn;
    try {
        conn = await pool.getConnection();
        let result = await conn.execute(
            `select content.id, title, releaseDate, runtime, cover   
            from content, recommended
            where content.id = content_id order by content.id`
        );

        for(let i = 0; i < result.rows.length; i++){
            let genres = await conn.execute(
                `select genres.name
                from genres, content_genres
                where genres_id = genres.id and content_id = :id`, [result.rows[i][0]]
            )

            let genre_arr = [];    
            for(let j = 0; j < genres.rows.length; j++){
                genre_arr.push(genres.rows[j][0] + " ");
            }
            
            
            result.rows[i].push(genre_arr);
            
        }
 
        res.status(200).json(result.rows);

    } catch (err) {
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function addContent(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result = await conn.execute(
        `select max(id) from content` 
        )
        let id;
        if(result.rows.length === 0){
            id = 1;
        }
        else{
            id = result.rows[0][0] + 1;
        }

        result = await conn.execute(
            `insert into content values (:id, :title, :releasedate, :runtime, :tagline, :voteavg, :votecount, :popularity, :image, :cover, :type)`,
            [id, data.title, data.releaseDate, data.runtime, data.tagline, data.voteAvg, data.voteCount, data.popularity, data.image, data.cover, data.type]
        );
        


        if(data.type === 'movie'){    
            result = await conn.execute(
                `insert into movies values (:id, :movieid, :overview)`,
                [id, id, data.movie.overview]
            )

            let boxoffice_id;
            result = await conn.execute(
                `select max(id) from box_office`
            )
            if (result.rows[0][0] === null){
                boxoffice_id = 1;
            }
            else{
                boxoffice_id = result.rows[0][0] + 1;
            }

            result = await conn.execute(
                `insert into box_office values (:id, :budget, :revenue, :movieid)`,
                [boxoffice_id, data.movie.budget, data.movie.revenue, id]
            )
 
        }
        else{           
             result = await conn.execute(
                `insert into tv_shows values (:id, :tvid, :episodes, :season )`,
                [id, id, data.tvshow.episodes, data.tvshow.seasons]
            )
        }

        res.status(200).json(id);
      
    } catch (err) {
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function search(req, res, pool) {
    
    let conn;
    const data = req.body;
    try {
        conn = await pool.getConnection();
        let result; 
        if(data.from  === 'Cast Members'){
            result = await conn.execute(
            `SELECT id, name
            from  celebrities
            WHERE lower(name) LIKE :match`, [data.match+'%']
            , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
        }

        else if (data.from === 'Crew Members'){
            result = await conn.execute(
                `SELECT id, name
                from  crew_members
                WHERE lower(name) LIKE :match`, [data.match+'%']
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
                )            
        }
        
        res.status(200).json(result.rows); 

    } catch (err) {
    console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function getContentDetails(req, res, pool) {
    let conn;
    let content_data = {};
    const id = req.body.content_id;
    try {
        conn = await pool.getConnection();
        let result; 
        result = await conn.execute(
            `select title, releaseDate, type from content where id = :id`, [id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        content_data.content = result.rows[0];

        result = await conn.execute(
            `select genres.name
            from genres, content_genres
            where genres_id = genres.id and content_id = :id`, [id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        content_data.genres = result.rows;

        result = await conn.execute(
            `select locations.name
            from locations, filming_locations
            where locations_id = locations.id and content_id = :id`, [id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        content_data.locations = result.rows;

        result = await conn.execute(
            `select production_co.name
            from production_co, produced_by
            where production_co_id = production_co.id and content_id = :id`, [id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        content_data.production_co = result.rows;

        result = await conn.execute(
            `select plot_keywords.name
            from plot_keywords, plots
            where plot_keywords_id = plot_keywords.id and content_id = :id`, [id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        content_data.plot_keywords = result.rows;

        result = await conn.execute(
            `select languages.name
            from languages, spoken_languages
            where languages_id = languages.id and content_id = :id`, [id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        content_data.languages = result.rows;

        result = await conn.execute(
            `select celebrities_id, celebrities.name, order_no, character
            from cast, celebrities
            where celebrities_id = celebrities.id and content_id = :id`, [id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        content_data.cast = result.rows;

        result = await conn.execute(
            `select id, name
            from credits, crew_members
            where crew_members_id = crew_members.id and content_id = :id`, [id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )
        
        content_data.crew = result.rows;
        res.status(200).json(content_data); 

    } catch (err) {
        res.status(400).json("error getting content data");
        console.log('Ouch!', err)
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function getContentData(req, res, pool) {
    
    let conn;
    try {
        conn = await pool.getConnection();
        let result; 
        result = await conn.execute(
            `select * from content where id = :id`, [req.body.id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
        )    
        result = result.rows[0];
        if(result.TYPE === 'movie'){
            let moviedata = await conn.execute(
                `select overview from movies where id = :id`, [req.body.id]
            )
            let movie = {OVERVIEW: moviedata.rows[0][0]}
            let boxoffice_data = await conn.execute(
                `select budget, revenue from box_office where Movies_movieid = :id`, [req.body.id]
            )
            if(boxoffice_data.rows.length !== 0){
                movie.BUDGET = boxoffice_data.rows[0][0];
                movie.REVENUE = boxoffice_data.rows[0][1];            
            }
            else{
                movie.BUDGET = '';
                movie.REVENUE = '';
            }

            result.movie = movie;
        }
        else{
            let tvdata = await conn.execute(
                `select episodes, seasons from tv_shows where id = :id`, [req.body.id], {outFormat: oracledb.OUT_FORMAT_OBJECT}
            )
            let tvshow = tvdata.rows[0];
            result.tv_show = tvshow;
        }

        res.status(200).json(result); 

    } catch (err) {
        console.log(err.message);
        if(err.message === `Cannot read property '0' of undefined`){
            res.status(404).json('not found');
            
        }
        res.status(400).json('error editing content data');

    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}
async function editContentData(req, res, pool) {
    
    let conn;
    try {
        conn = await pool.getConnection();
        let data = req.body;
        console.log(data);
        let result; 
        result = await conn.execute(
            `update content 
            set title = :title, releaseDate = :releaseDate, runtime = :runtime, 
            tagline = :tagline, voteAvg = :voteAvg, voteCount = :voteCount, 
            popularity = :popularity, image = :image, cover = :cover
            where id = :id`, [data.title, data.releaseDate, data.runtime, data.tagline
            , data.voteAvg, data.voteCount, data.popularity, data.image, data.cover, data.content_id]
        )
        if(data.type === 'movie'){
            result = await conn.execute(
                `update movies
                set overview = :overview
                where id = :id`, [data.movie.overview, data.content_id]
            )
            result = await conn.execute(
                `update box_office
                set budget = :budget, revenue = :revenue
                where Movies_movieid = :id`, [data.movie.budget, data.movie.revenue, data.content_id] 
            )
        }
        else{
            result = await conn.execute(`
                update TV_Shows
                set episodes = :episodes, seasons = :seasons
                where id = :id`, [data.tvshow.episodes, data.tvshow.seasons, data.content_id]
            )
            console.log(result);
        }

        res.status(200).json('edited successfully');
    } catch (err) {
        res.status(400).json('error editing content data');
        console.log(err);
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}

async function deleteContentData(req, res, pool) {
    
    let conn;
    try {
        conn = await pool.getConnection(); 
        let result = await conn.execute(
            `delete from content where id = :id`, [req.body.id]
        )
        
       
        res.status(200).json('deleted successfully');
    } catch (err) {
        res.status(400).json('error deleting content data');
        console.log(err);
    } finally {
    if (conn) { // conn assignment worked, need to close
        await conn.close()
    }
    }
}