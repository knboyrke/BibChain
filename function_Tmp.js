
/***** sidebar setting start *****/

/**
 * remove '.bold' and make the icon and text bold when the button is clicked
 */
$(document).ready(function(){
    // add a new id to $('#home, #list')
    $('#home, #list').click(function(){
        // text change
        $('.bold').removeClass('bold');
        $(this).addClass('bold');

        // image change
        $('img').attr('src', function() {
            return $(this).attr('src').replace('_bold', '');
        });
        $(this).find('img').attr('src', function() {
            return $(this).attr('src').replace('.svg', '_bold.svg');
        });
    });
});

/***** sidebar setting end *****/


/***** main setting start *****/

//tooltip
$(document).ready(function(){
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
});

//----------------------------------------------------------------------------------------------------------
// declaration of regular expressions（OK to have a single-byte space on either side of the =, like '* = {}'）
//----------------------------------------------------------------------------------------------------------
// ❶ title={}：exclude booktitle
const titleRegex = /(?<![a-zA-Z])title\s*=\s*\{(.+?)\}/;

// ❷ author={}：
const authorRegex = /author\s*=\s*\{(.+?)\}/;

// ❸ journal={}, booktitleRegex={}
const journalRegex = /journal\s*=\s*\{(.+?)\}/;
const booktitleRegex = /booktitle\s*=\s*\{(.+?)\}/;

// ❹ year={}：
const yearRegex = /year\s*=\s*\{(.+?)\}/;

// ❺ year={****}：only four-digit numbers
const year_4Digit_Regex = /^\d{4}$/;

// ❻ year={(参照2024/02/18)}：four digits in a string
const fourDigitRegex = /\d{4}/g;

// ❼ find 'http'
const httpRegex = /^http/;



/**
 * ① title duplicate check
 * ② store author information for changing variables, and add the number of occurrences after the name if it is duplicated  ex). tanaka2
 * ③ add year to array
 * @param {string} BibText // contents of the textarea
 * @param {string} area // show warning above for 'alertArea1' / below for 'alertArea2'
 * @returns {string[]}  ① title information, ② author information ③ year information
 */
function SplitBib(BibText,area){
    let errorJudge = false; // flag for exception handling
    let errorMessages = ""; // variables for strings thrown together with exceptions

    // store separated by @*{*}
    let splitText = BibText.split("@").filter(p => p.trim() !== "");

    // store title and first author in set
    let titleSet = new Set();
    let authorSet = new Set();
    let authorCountMap = new Map(); // author の出現回数をカウントする
    let yearArray = []; // year の配列
    let countBib = 0; // エラー表示のために、Bib形式をカウントする変数

    // 論文の情報の配列をループ処理
    for (let eachBib of splitText) {
        countBib += 1;

        // -------------------------------------
        //　① タイトルの重複チェック

        // 正規表現：title={*} の中の * の文字列を取得
        let title = eachBib.match(titleRegex);

        if(title !== null){
            // title を更新
            title = eachBib.match(titleRegex)[1];
            //同じ論文を掲載していないか重複チェック
            if (titleSet.has(title)  === true) {
                errorJudge = true;
                // 論文重複のため、エラー
                // エラーを RewriteVariable() に投げる
                errorMessages += '<div class="alert alert-danger">「' + title + '」<br>　論文が重複しているので、1つだけにしてください</div>';
                // cursorPosition = BibText.indexOf(title);
                // document.getElementById('textarea1').setSelectionRange(cursorPosition,cursorPosition);
                // document.getElementById('textarea1').focus();
                //throw '<div class="alert alert-danger">' + title + '<br>論文が重複しているので、1つだけにしてください</div>';
            } else {
                // title を set に追加
                titleSet.add(title);
            }
        }else{
            errorJudge = true;
            // タイトル情報欠如のため、エラー
            // エラーを RewriteVariable() に投げる
            errorMessages += '<div class="alert alert-danger">' + countBib + '番目のBibのタイトル情報がありません</div>';
            //throw '<div class="alert alert-danger">' + countBib + '番目のBibのタイトル情報がありません</div>';
        }

        // -------------------------------------



        // -------------------------------------
        //　② 著者情報の取得 + 著者出現回数のカウント（bibの変数名変更準備）
    
        // author を抽出
        let author = eachBib.match(authorRegex); // 正規表現：author={*} の間の文字列を取得

        if(author !== null){
            // author を更新
            author = eachBib.match(authorRegex)[1];

            // author の一人目の名前を取得
            let firstName;
            if (author.includes(" and ") === true) {
                //もし「,」があれば、「,」で区切って最初の名前を代入：（例）Tanaka, Taro and Yamada, Hanako...
                if(author.includes(",") === true){
                    firstName = author.split(",")[0];
                }else{
                    firstName = author.split(" and ")[0];// andで分割してファーストオーサーを取得
                }
                
                // apiによる変換処理
                // 処理
            } else {
                // もしandがなければ、「,」で区切って最初の名前を代入：（例）Tanaka, Taro Yamada Hanako...
                firstName = author.split(",")[0];
            }

            // author の出現回数をカウント
            if (authorCountMap.has(firstName)) {
                // すでに出現していたらカウントを +1
                authorCountMap.set(firstName, authorCountMap.get(firstName) + 1);
            } else {
                // 初めて出現したらカウントを 1 に
                authorCountMap.set(firstName, 1);
            }

            // author が重複したら名前の後に出現回数分の数字を追加
            if (authorCountMap.get(firstName) > 1) {
                // 名前 + 出現回数
                firstName = firstName + authorCountMap.get(firstName);
            }
            // author を set に追加
            authorSet.add(firstName);
        }else{
            errorJudge = true;
            // 著者がいないため、エラー
            // エラーを RewriteVariable() に投げる
            if(title !== null){
                errorMessages += '<div class="alert alert-danger">「'+ title + '」<br>　著者情報がないので、追記してください</div>';
            }else{
                errorMessages += '<div class="alert alert-danger">著者情報がないので、追記してください</div>'
            }
            //throw '<div class="alert alert-danger">'+ title + '<br>著者情報がないので、追記してください</div>';
        }

        // -------------------------------------


        // -------------------------------------
        // ③書誌情報の確認（miscの場合は対象外）

        if(journalRegex.test(eachBib) === false && booktitleRegex.test(eachBib) === false && area === 'alertArea1'){
            const warningJournal = '<div class="alert alert-warning">「' + title + '」に<br>　書誌情報がないので、追記することをオススメします</div>';

            //黄色く忠告表示
            $('#alertArea').html($('#alertArea').html() + warningJournal);
        }


        // -------------------------------------


        
        // -------------------------------------
        //　④ 参考文献の年度を取得（記載がない場合の処理も）

        // year を抽出する
        let year = eachBib.match(yearRegex); // 正規表現：year={*} の間の文字列を取得
        
        // year={*} がある場合
        if(year !== null){
            year = eachBib.match(yearRegex)[1]; // yearを更新

            // year が「4桁の数字のみ」と一致しない場合（例：参照2024/02/15）
            if (!year_4Digit_Regex.test(year)) {

                // year の中から、4桁の数字の連続する部分を検索
                const matches = year.match(fourDigitRegex);
                
                // 4桁の数字が見つかった場合
                if (matches) {
                    year = matches[0]; // 最初に見つかった4桁の数字を追加
                } else {
                    year = ''; // 4桁の数字が見つからない場合は、空欄とする
                    const warningYear = '<div class="alert alert-warning">「' + title + '」に<br>　年度情報がないので、追記することをオススメします</div>';

                    if(area === 'alertArea1'){
                        $('#alertArea').html($('#alertArea').html() + warningYear);//黄色く忠告表示
                    }else if(area === 'alertArea2'){
                        $('#alertArea2').html($('#alertArea2').html() + warningYear);//黄色く忠告表示
                    }
                }
            }
        }else{
            year = ''; // year がない場合は空文字を追加
            const warningYear = '<div class="alert alert-warning">「' + title + '」に<br>　年度情報がないので、追記することをオススメします</div>';
            //黄色く忠告表示
            if(area === 'alertArea1'){
                $('#alertArea').html($('#alertArea').html() + warningYear);
            }else if(area === 'alertArea2'){
                $('#alertArea2').html($('#alertArea2').html() + warningYear);
            }
        }
        
        // year を配列に追加する
        yearArray.push(year);
    }

    if(errorJudge === true){
        throw errorMessages;
    }

    // 返り値：①タイトル情報、②著者情報、③年度情報
    return [titleSet,authorSet,yearArray];
}



/**
 * タイトルの大文字を小文字にさせないようにするために{}で囲む
 * @param {string} title //
 * @returns {string} //
 */
function TitleCapitalLetter(title){
    //大文字をtitleの中から見つけたら{}で囲み、もし大文字が連続していたらその両端を{}で囲む
    let capitalizedTitle = title.replace(/([A-Z]+)([^A-Z]*)/g, '{$1}$2');
    return capitalizedTitle;
};


/**
 * 
 * @param {string} ref //入力した文章
 * @param {string} area //警告位置を指定する
 * @returns {string} //エラーが出たら-1を返す
 */
function RewriteVariable(ref,area){
    if(area === 'alertArea1'){
        //もし、alertコメントが出ているならば、削除する
        const childDiv = document.getElementById("alertArea");//子div要素の取得
        childDiv.textContent = "";
    }

    if (ref === '') {
        $('#alertArea').html('<div class="alert alert-danger">テキストエリアが空です</div>');
    }else{
        try{
            // エラーが出れば、catchの中でエラー処理
            let bibData = SplitBib(ref,area);
            // Bibの新しい変数名を格納する配列
            let newVariable = [];
            let capitalizedTitle_Array = [];

            // [0]：タイトル（Set）
            // [1]：著者（Set）
            // [2]：年度（Array）
            let title_Array = Array.from(bibData[0]);
            let author_Array = Array.from(bibData[1]);
            let year_Array = Array.from(bibData[2]);
            

            //--------------------------------------------
            // タイトルの整形

            // 大文字に{}をつけたBib形式に変換（Latexで小文字になるのを防ぐため）
            title_Array.forEach((element) => {
                capitalizedTitle_Array.push(TitleCapitalLetter(element));
            });

            // 文章全体のタイトルの中の大文字に{}をつける
            let i = 0; // 要素番号
            const text_arrangeTitle = ref.replace(/(?<![a-zA-Z])title=\{(.+?)\}/g, (replacedTitle,p1) => {
                return replacedTitle.replace(p1,capitalizedTitle_Array[i++]);
            });

            //--------------------------------------------


            
            //--------------------------------------------
            // 変数名の置換

            // newVariable に 「著者 + 年度」 情報を軸とした変数名を格納
            author_Array.forEach((eachAuthor, index) => {
                let tmp = eachAuthor; // 一時的に eachAuthor を代入するための変数
                if(year_Array[index] !== ''){
                    tmp = tmp + "_" + year_Array[index];
                }
                
                newVariable.push(tmp);
            });
            
            // BIB形式のそれぞれの変数名を変更する
            i = 0; // 要素番号
            const output = text_arrangeTitle.replace(/@.*?{([^,]*)/g, (replacedText, p1) => {                
                return replacedText.replace(p1, newVariable[i++]);
            });

            //--------------------------------------------

            return output;

        }catch (error) {
            // 赤くエラーを表示
            $('#alertArea').html(error);
        }
    }
    
    return -1;
}

/**
 * 「.bib」ファイルをダウンロードする
 * @param {string} outputText 
 */
function BibFileDonwload(outputText){
    let blob = new Blob([outputText], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;

    // reference.bib という名前のファイルを保存する
    a.download = 'reference.bib';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


/**
 * ボタンを押した時に、処理を実行
 */
function ButtonPress(){
    //テキストエリアの内容を取得
    let bibReference = document.getElementById('textarea1').value;
    let outputBib = RewriteVariable(bibReference,'alertArea1');

    if(outputBib !== -1){
        // ボタンを押すと reference.bib をダウンロードする
        BibFileDonwload(outputBib);
    }
}


//Ajaxによるページ切り替え
$('.sidelikes a').on('click', function() {
    
});


function generateBibTex() {

    //もし、alertコメントが出ているならば、削除する
    const childDiv = document.getElementById("alertArea2");//子div要素の取得
    childDiv.textContent = "";

    const title    = $('#title').val();
    const author   = $('#author').val();
    const url      = $('#url').val();
    const year     = $('#year').val();

    const allAlert = checkInput_Alert(title,author);

    if(allAlert[1] === true){
        $('#alertArea2').html(allAlert[0]);
    }else{
        const variable = 'tmp'; // 仮の変数名 //のちにRewriteVariable関数で変更する
        
        /*
            // 出力イメージ
            @misc{variable,
                title = {title},
                author = {author},
                howpublished = {\url{url}},
                year = {year}
            }
        */

        // 生成するBib形式
        let tmpTxt;
        if(httpRegex.test(url)){
            tmpTxt = `@misc{${variable},&#10;    title={${title}},&#10;    author={${author}},&#10;    howpublished={\\url{${url}}},&#10;    year={${year}}&#10;}&#10;&#10;`;
        }else{
            if(url.trim() === ''){
                tmpTxt = `@misc{${variable},&#10;    title={${title}},&#10;    author={${author}},&#10;    year={${year}}&#10;}&#10;&#10;`;
            }else{
                tmpTxt = `@misc{${variable},&#10;    title={${title}},&#10;    author={${author}},&#10;    howpublished={${url}},&#10;    year={${year}}&#10;}&#10;&#10;`;
            }
        }
        const tmpBib = RewriteVariable(tmpTxt,'alertArea2');
        $('#textarea2').html($('#textarea2').html() + tmpBib);
        console.log($('#textarea2').val());
        console.log(tmpBib);
    }

}

function checkInput_Alert(title,author){
    let outputAlert="";
    let flag_Alert = false;

    if(title === ''){
        outputAlert += '<div class="alert alert-danger">タイトルを正しく記入してください</div>';
        flag_Alert = true;
    }

    if(author === ''){
        outputAlert += '<div class="alert alert-danger">著者を正しく記入してください</div>';
        flag_Alert = true;
    }

    if(yearJudge === false){
        outputAlert += '<div class="alert alert-danger">年度を正しく記入してください</div>';
        flag_Alert = true;
    }

    return [outputAlert,flag_Alert];
}


///-----------------------------------
/// 年度の内容をチェックするためのフラグ
///-----------------------------------
var yearJudge = false;


// 入力フィールドの値が変更されたときに呼び出される関数
function checkInput_Animation(input_id) {

    let inputField = document.getElementById(input_id); // 入力フィールドの要素を取得
    let checkmark = document.getElementById(input_id + "_checkmark"); // チェックマークの要素を取得
    let inputVal = inputField.value;

    if(input_id !== 'year'){
        if (inputVal.trim() !== "") { // 入力フィールドが空でない場合
            checkmark.style.display = "inline-block"; // チェックマークを表示する
            checkmark.style.animation = ""; // アニメーションをリセットする
        } else {
            // 入力フィールドが空の場合、チェックマークを非表示にし、アニメーションをトリガーする
            checkmark.style.animation = "fadeOutRotate 0.5s forwards";
            setTimeout(function() {
                checkmark.style.display = "none";
            }, 500); // アニメーションの時間と合わせて非表示にする
        }
    }else{
        let xmark = document.getElementById("year_xmark");
        const regex = /\b\d{4}\b/g;
        if(regex.test(inputVal)){
            if (inputVal.trim() !== "") {
                yearJudge = true;
                xmark.style.display = "none"; // チェックマークを表示する
                xmark.style.animation = ""; // アニメーションをリセットする
                checkmark.style.display = "inline-block"; // チェックマークを表示する
                checkmark.style.animation = ""; // アニメーションをリセットする
            }
        }else{
            yearJudge = false;
            if (inputVal.trim() !== "") { // 入力フィールドが空でない場合
                checkmark.style.display = "none"; // チェックマークを表示する
                checkmark.style.animation = ""; // アニメーションをリセットする
                xmark.style.display = "inline-block"; // チェックマークを表示する
                xmark.style.animation = ""; // アニメーションをリセットする
            } else {
                // 入力フィールドが空の場合、チェックマークを非表示にし、アニメーションをトリガーする
                xmark.style.animation = "fadeOutRotate 0.5s forwards";
                setTimeout(function() {
                    xmark.style.display = "none";
                }, 500); // アニメーションの時間と合わせて非表示にする

                // 入力フィールドが空の場合、チェックマークを非表示にし、アニメーションをトリガーする
                checkmark.style.animation = "fadeOutRotate 0.5s forwards";
                setTimeout(function() {
                    checkmark.style.display = "none";
                }, 500); // アニメーションの時間と合わせて非表示にする
            }
        }
    }
    
}

$(document).ready(function(){
    // 入力フィールドの値が変更されるたびにcheckInput_Animation関数を呼び出す
    document.getElementById("author").addEventListener("input", function() {
        checkInput_Animation("author");
    });

    document.getElementById("title").addEventListener("input", function() {
        checkInput_Animation("title");
    });

    document.getElementById("url").addEventListener("input", function() {
        checkInput_Animation("url");
    });

    document.getElementById("year").addEventListener("input", function() {
        checkInput_Animation("year");
    });
});


$(document).ready(function(){
    const radioButton1 = document.getElementById('radio1');
    const radioButton2 = document.getElementById('radio2');
    const radioButton3 = document.getElementById('radio3');
    const radioButton4 = document.getElementById('radio4');
    const bibCreateButton = document.getElementById('bibCreateButton');
    const textArea1 = document.getElementById("textarea1");
    const textArea2 = document.getElementById("textarea2");
    
    function buttonClick(radioButton, textArea) {
        if(radioButton.checked === true){
            $(textArea).addClass('textarea_scroll');
        }else{
            $(textArea).removeClass('textarea_scroll');
        }
    }

    
    // テキストエリアの高さを自動調整する関数
    function resizeTextarea(textArea) {
        textArea.style.height = "auto"; // 高さを自動に設定して一時的に解放する
        textArea.style.height = textArea.scrollHeight + "px"; // スクロール高さをセット
    }

    function TextAreaShape(textarea,col,row){
        textarea.style.height = ""; // 空文字列をセットして元の状態に戻す
        textarea.cols = col;
        textarea.rows = row;
    }

    // テキストエリアの入力時に高さを自動調整する
    textArea1.addEventListener("input", function () {
        if(radioButton2.checked === true){
            resizeTextarea(textArea1); // テキストエリアの高さを調整
        }
    });

    radioButton1.addEventListener('click',function(){
        buttonClick(radioButton2,'#textarea1');
        TextAreaShape(textArea1,"100","20");
    });

    radioButton2.addEventListener('click',function(){
        buttonClick(radioButton2,'#textarea1');
        resizeTextarea(textArea1);
    });

    textArea2.addEventListener("input",function(){
        if(radioButton4.checked === true){
            resizeTextarea(textArea2); // テキストエリアの高さを調整
        }
    });

    radioButton3.addEventListener('click',function(){
        buttonClick(radioButton4,'#textarea2');
        TextAreaShape(textArea2,"105","20");
    });

    radioButton4.addEventListener('click',function(){
        buttonClick(radioButton4,'#textarea2');
        resizeTextarea(textArea2);
    });

    bibCreateButton.addEventListener('click',function(){
        if(radioButton4.checked === true){
            buttonClick(radioButton4,'#textarea2');
            resizeTextarea(textArea2);
        }
    });

});


$(window).on("beforeunload", function(e) {
    if ($("#textarea1").val().length > 0 || $("#textarea2").val().length > 0 || $('#title').val().length > 0 || $('#author').val().length > 0 || $('#url').val().length > 0 || $('#year').val().length > 0) {
        e.preventDefault();
        // e.returnValue = "本当にページを終了しますか？";
        return "本当にページを終了しますか？"; 
    }
});


function AllDelete(area){
    if(area === 'BibInput'){
       $('#title').val('');
       $('#author').val('');
       $('#url').val('');
       $('#year').val('');

       checkInput_Animation('title');
       checkInput_Animation('author');
       checkInput_Animation('url');
       checkInput_Animation('year');
    }
}

/***** main setting end *****/


/***** top button start *****/

/**
 * move to the top of the page
 */
$(document).ready(function(){
    const pagetop_button = $('#button_top');

    pagetop_button.click(function(){
        window.scroll({ top: 0, behavior: 'smooth' });
    });
    
    // show/hide the button and change css
    $(window).scroll(function(){
        if (window.scrollY > 30) {
            pagetop_button.css({'opacity': '1', 'visibility': 'visible'});
            /*
                pagetop_button.style.opacity = "1";
                pagetop_button.style.visibility = "visible";
            */
        } else {
            pagetop_button.css({'opacity': '0', 'visibility': 'hidden'});
            /*
                pagetop_button.style.opacity = "0";
                pagetop_button.style.visibility = "hidden";
            */
        }
    });
});

/***** top button end *****/