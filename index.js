
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const connection = require('./lib/db');

const app = express();


// 데이터베이스 연결
//connection.connect();

//bodyparser 정의
app.use(bodyParser.urlencoded({
    extended: false,
}))

app.use(express.static(`${__dirname}/public`));

app.listen(3000, () => {
    console.log('Server is running port 3000!');
    //데이터 베이스 연결 
    //connection.connect();
});

// connection.query('SELECT * from recycle', (error, results, fields) => {
//     if (error) throw error;
//     console.log(results);
// });

//create쿼리문 사용
// connection.query('create table recycle (num INT NOT NULL PRIMARY KEY, item VARCHAR(10) NOT NULL, category VARCHAR(20) NOT NULL, method VARCHAR(300) NULL, notice VARCHAR(300) NULL);', (error, results, fields) => {
//     if (error) throw error;
//     console.log('table 생성 완료!');
// });


//insert 값 입력
// connection.query('insert into recycle (num, item, category, method, notice) values (1,\'귤 껍질\',\'음식물 쓰레기\',\'<음식물 쓰레기>배출방법을 준수하여 배출합니다.\',\'가축의 사료로 사용할 수 있으면 음식물 쓰레기입니다.\');', (error, results, fields) => {
//     if (error) throw error;
//     console.log('데이터 입력 성공!');
// })

//접속하면 페이지 출력
app.get('/', (request, response) => {
    fs.readFile('public/list.html', 'utf-8', (error, data) => {
        connection.query('select * from recycle ORDER BY num DESC', (error, results, fields) => {
            if (error) throw error;
            response.send(ejs.render(data, {
                data: results,
            }));
        });
    });
});

app.get('/create', (request, response) => {
    fs.readFile('public/listcreate.html', 'utf-8', (error, data) => {
        if (error) throw error;
        response.send(data);
    })
})


// 데이터 추가 ,post요청이 발생하면
app.post('/create', (request, response) => {
    const body = request.body;
    connection.query('INSERT INTO recycle (num, item, category, method, notice) VALUE (?,?,?,?,?)',
        [body.num, body.item, body.category, body.method, body.notice], (error) => {
            if (error) throw error;
            //조회페이지로이동
            response.redirect('/');
        });
});

//데이터검색
// app.get("/search", (req, res) => {
//     const query = req.query.query; // 검색어 가져오기

//     // 데이터베이스에서 검색 쿼리 실행
//     connection.query("SELECT * FROM recycle WHERE item LIKE ?", [`%${query}%`], (error, results) => {
//         if (error) throw error;

//         // 검색 결과를 클라이언트에 보내기
//         fs.readFile('public/search.html', 'utf-8', (_err, data) => {
//             res.send(ejs.render(data, {
//                 data: results,
//             }));
//         });
//     });
// });

app.get("/search", (req, res) => {
    const category = req.query.category; // select-option에서 선택한 값 가져오기
    const query = req.query.query; // input 창에 입력한 검색어 가져오기

    // 데이터베이스에서 검색 쿼리 실행
    let sqlQuery;
    let sqlParams;

    if (category === "전체") {
        // 모든 카테고리에서 검색
        sqlQuery = "SELECT * FROM recycle WHERE item LIKE ?";
        sqlParams = [`%${query}%`];
    } else {
        // 특정 카테고리에서 검색
        sqlQuery = "SELECT * FROM recycle WHERE category = ? AND item LIKE ?";
        sqlParams = [category, `%${query}%`];
    }

    connection.query(sqlQuery, sqlParams, (error, results) => {
        if (error) throw error;

        // 검색 결과를 클라이언트에 보내기
        fs.readFile('public/search.html', 'utf-8', (_err, data) => {
            res.send(ejs.render(data, {
                data: results,
            }));
        });
    });
});



//데이터 수정
app.get('/modify/:id', (request, response) => {
    // 파일을 읽어온다
    fs.readFile('public/listupdate.html', 'utf-8', (error, data) => {
        connection.query('select * from recycle where num = ?', [request.params.id], (error, results) => {
            if (error) throw error;
            console.log(request.params.id);

            // results 배열의 첫 번째 요소가 있는지 확인하고, 없으면 빈 객체를 사용
            const itemData = results[0] || {};
            response.send(ejs.render(data, {
                data: itemData,
            }));
        });
    });
});

//데이터 modify 하기 
app.post('/modify/:id', (request, response) => {
    const body = request.body;
    connection.query('UPDATE recycle SET category = ?, method = ? ,notice = ? WHERE num =?',
        [body.category, body.method, body.notice, request.params.id], (error, results) => {
            if (error) throw error;
            //조회페이지로 이동
            response.redirect('/');
        });
});

//데이터 삭제
app.get('/delete/:id', (request, response) => {
    connection.query('DELETE FROM recycle WHERE num=?', [request.params.id], () => {
        //조회페이지로 이동
        response.redirect('/');
    });
});

//연결종료
// connection.end();