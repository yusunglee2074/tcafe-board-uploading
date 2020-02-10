const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;

const ids = {
  lys20742: 'vLa4ivKFLVnWFKz',
  klqn2n: 'sjdmlrl4',
  lys20741: 'sjdmlrl4',
  lysspdlqj: 'sjdmlrl4',
};
const boardUrl = {
  cook: 'http://tcafe2a.com/bbs/board.php?bo_table=c_food&page=',
  gongpo: 'http://tcafe2a.com/bbs/board.php?bo_table=c_gongpo&page=',
  humor: 'http://tcafe2a.com/bbs/board.php?bo_table=c_humor&page=',
  jjal: 'http://tcafe2a.com/bbs/board.php?bo_table=c_jjalbang&page=',
  enter: 'http://tcafe2a.com/bbs/board.php?bo_table=c_enter&page=',
  heal: 'http://tcafe2a.com/bbs/board.php?bo_table=c_heal&page=',
};
const boardWriteUrl = {
  cook: 'http://tcafe2a.com/bbs/write.php?bo_table=c_food',
  gongpo: 'http://tcafe2a.com/bbs/write.php?bo_table=c_gongpo',
  humor: 'http://tcafe2a.com/bbs/write.php?bo_table=c_humor',
  jjal: 'http://tcafe2a.com/bbs/write.php?bo_table=c_jjalbang',
  enter: 'http://tcafe2a.com/bbs/write.php?bo_table=c_enter',
  heal: 'http://tcafe2a.com/bbs/write.php?bo_table=c_heal',
};

const main = async () => {

  const makePageAndMakeCronJobWithLogin = async (id) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://tcafe2a.com/', {timeout: 0});
    await page.waitForSelector('input[name="mb_id"]');
    await page.type('input[name="mb_id"]', id);
    await page.type('input[name="mb_password"]', ids[id]);
    await page.click('input[class="login-button"]');

    return new CronJob('0 */6 * * * *', async () => {
      console.log('글쓰기 시작, 현재시각 : ' + new Date);
      await page.waitFor(randomInt(100, 3000));
      const boardNames = [...shuffle(Object.keys(boardUrl))];
      console.log('작성 예정 게시판', boardNames);

      for (const boardName of boardNames) {
        console.log(boardName + ' 게시판에 글 쓰러간다');
        const {title, content} = await getTitleAndContent(page, boardName);
        if (content.indexOf('iframe') === -1) {
          await writeBoard({
            page,
            boardName,
            title, content,
          });
        }
      }
    }, null, true, 'America/Los_Angeles');
  };

  const randomInt = (low, high) => {
    return Math.floor(Math.random() * (high - low) + low)
  };
  const shuffle = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  const getTitleAndContent = async (page, boardName) => {
    const url = boardUrl[boardName] + randomInt(30, 100);
    await page.goto(url);
    let boardId;
    let title;
    const randomNum = randomInt(5, 40);
    boardId = await page.$eval(`table#tbl_board tbody tr:nth-child(${randomNum}) td.l_num`, e => e.innerText);
    title = await page.$eval(`table#tbl_board tbody tr:nth-child(${randomNum}) td.l_subj a span`, e => e.innerText);
    await page.goto(url + '&wr_id=' + boardId);

    if (title[0] === '[') title = title.slice(5);
    const content = await page.$eval(`div#view_${boardId}`, e => {
      let html = e.innerHTML.slice(39);
      return html.slice(0, html.length - 31);
    });

    return {title, content};
  };

  const writeBoard = async ({page, boardName, title, content}) => {
    await page.goto(boardWriteUrl[boardName]);
    await page.type('input[id="wr_subject"]', title);
    // await page.click('div[class="cheditor-tab-code-off"]');
    const element = await page.$('div[class="cheditor-tab-code-off"]');
    await element.click();
    await page.type('textarea[class="cheditor-editarea-text-content"]', content);
    if (boardName !== 'talkCafe' && boardName !== 'mystery') {
      await page.evaluate(() => {
        document.querySelector('select option:nth-child(2)').selected = true;
      })
    }
    await page.click('input[id="btn_submit"]');
  };

  console.log("시작시각 ", new Date);
  // Add a wait for some selector on the home page to load to ensure the next step works correctly


  for (const id of Object.keys(ids)) {
    const job = await makePageAndMakeCronJobWithLogin(id);
    job.start();
    console.log(`${id} 로그인 완료`);
  }

};

main();
