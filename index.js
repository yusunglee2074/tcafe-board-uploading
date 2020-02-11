const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;

const ids = {
  lys20742: 'vLa4ivKFLVnWFKz',
  klqn2n: 'sjdmlrl4',
  lys20741: 'sjdmlrl4',
  lysspdlqj: 'sjdmlrl4',
};
const boardUrl = {
  // cook: 'http://tcafe2a.com/bbs/board.php?bo_table=c_food&page=',
  gongpo: 'http://tcafe2a.com/bbs/board.php?bo_table=c_gongpo&page=',
  humor: 'http://tcafe2a.com/bbs/board.php?bo_table=c_humor&page=',
  jjal: 'http://tcafe2a.com/bbs/board.php?bo_table=c_jjalbang&page=',
  enter: 'http://tcafe2a.com/bbs/board.php?bo_table=c_enter&page=',
  heal: 'http://tcafe2a.com/bbs/board.php?bo_table=c_heal&page=',
  // comic: 'http://tcafe2a.com/bbs/board.php?bo_table=c_comic&page=',
};
const boardWriteUrl = {
  // cook: 'http://tcafe2a.com/bbs/write.php?bo_table=c_food',
  gongpo: 'http://tcafe2a.com/bbs/write.php?bo_table=c_gongpo',
  humor: 'http://tcafe2a.com/bbs/write.php?bo_table=c_humor',
  jjal: 'http://tcafe2a.com/bbs/write.php?bo_table=c_jjalbang',
  enter: 'http://tcafe2a.com/bbs/write.php?bo_table=c_enter',
  heal: 'http://tcafe2a.com/bbs/write.php?bo_table=c_heal',
  // comic: 'http://tcafe2a.com/bbs/write.php?bo_table=c_comic',
};

const main = async () => {

  const makePageAndMakeCronJobWithLogin = async (id, idx) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://tcafe2a.com/', {timeout: 100000});
    await page.waitForSelector('input[name="mb_id"]');
    await page.type('input[name="mb_id"]', id);
    await page.type('input[name="mb_password"]', ids[id]);
    await page.click('input[class="login-button"]');
    await page.on("dialog", (dialog) => {
      dialog.accept();
    });

    const cron = [
      '0 3,8,12,23,37,41,45,51,55,59 5-23,0,1 * * *',
      '0 1,7,14,29,32,38,42,50,53,54 5-23,0,1 * * *',
      '0 0,6,11,18,28,36,41,48,52,57 5-23,0,1 * * *',
      '0 2,5,11,14,34,39,42,47,54,11 5-23,0,1 * * *',
    ];
    return new CronJob(cron[idx], async () => {
      // return new CronJob('*/30 * * * * *', async () => {
      const point = await page.$eval('span.lg_pnt_n pnt_money', e => e.innerText);
      console.log(`현재 포인트: ${point}`);
      console.log('글쓰기 시작, 현재시각 : ' + new Date);
      if (randomInt(0, 100) < 65) {
        await page.waitFor(randomInt(100, 3000));
        const boardNames = [...shuffle(Object.keys(boardUrl))];
        console.log('작성 예정 게시판', boardNames);

        for (const boardName of boardNames) {
          console.log(boardName + ' 게시판에 글 쓰러간다');
          if (boardName === 'gongpo' || boardName === 'heal') {
            if (randomInt(0, 100) < 65) {
              continue;
            }
          }
          const {title, content} = await getTitleAndContent(page, boardName);
          if (content.indexOf('iframe') === -1) {
            await writeBoard({
              page,
              boardName,
              title, content,
            });
          }
        }
      } else {
        console.log('35퍼센트 확률로 그냥 안씀');
      }
    }, null, true, 'Asia/Tokyo');
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
    await page.goto(url, {timeout: 100000});
    let boardId;
    let title;
    const randomNum = randomInt(5, 40);
    boardId = await page.$eval(`table#tbl_board tbody tr:nth-child(${randomNum}) td.l_num`, e => e.innerText);
    title = await page.$eval(`table#tbl_board tbody tr:nth-child(${randomNum}) td.l_subj a span`, e => e.innerText);
    await page.goto(url + '&wr_id=' + boardId, {timeout: 100000});

    if (title[0] === '[') title = title.slice(5);
    const content = await page.$eval(`div#view_${boardId}`, e => {
      let html = e.innerHTML.slice(39);
      return html.slice(0, html.length - 31);
    });

    return {title, content};
  };

  const writeBoard = async ({page, boardName, title, content}) => {
    await page.goto(boardWriteUrl[boardName], {timeout: 100000});
    const alreadyExistTitle = await page.$eval('input[id="wr_subject"]', e => e.value);
    if (alreadyExistTitle) {
      console.log('글쓰기 에러 발생');
      await page.focus('input[id="wr_subject"]');
      await page.$eval('input[id="wr_subject"]', el => el.setSelectionRange(0, el.value.length));
      await page.keyboard.press('Backspace');
      await page.type('input[id="wr_subject"]', ' ');

      await page.waitForSelector('div[class="cheditor-tab-code-off"]');

      const element = await page.$('div[class="cheditor-tab-code-off"]');
      if (element == null) {
        await page.goto('http://tcafe2a.com/', {timeout: 100000});
        await page.keyboard.press('Enter');
      } else {
        await element.click();

        await page.focus('textarea[class="cheditor-editarea-text-content"]');
        await page.$eval('textarea[class="cheditor-editarea-text-content"]', el => el.setSelectionRange(0, el.value.length));
        await page.keyboard.press('Backspace');

        await page.type('textarea[class="cheditor-editarea-text-content"]', '1');
        if (boardName !== 'talkCafe' && boardName !== 'mystery') {
          await page.evaluate(() => {
            document.querySelector('select option:nth-child(2)').selected = true;
          })
        }

        await page.waitFor(1000);
        await page.click('input[id="btn_submit"]');

        await page.waitFor(2000);
        await page.click('td#mw_basic table tbody tr td a:nth-child(2)');

        await page.on("dialog", (dialog) => {
          dialog.accept();
        });

        await page.waitFor(10000);

        await page.keyboard.press('Enter');
      }

    } else {
      await page.type('input[id="wr_subject"]', title);
      // await page.click('div[class="cheditor-tab-code-off"]');
      const element = await page.$('div div.cheditor-viewmode div:nth-child(2)');
      await element.click();
      await page.type('textarea[class="cheditor-editarea-text-content"]', content);
      if (boardName !== 'talkCafe' && boardName !== 'mystery') {
        await page.evaluate(() => {
          document.querySelector('select option:nth-child(2)').selected = true;
        })
      }
      await page.click('input[id="btn_submit"]');
    }
  };

  console.log("시작시각 ", new Date);
  // Add a wait for some selector on the home page to load to ensure the next step works correctly


  let cronArryIdx = randomInt(0, 4);
  for (const id of Object.keys(ids)) {

    const idx = cronArryIdx;
    const job = await makePageAndMakeCronJobWithLogin(id, idx);
    cronArryIdx++;
    if (cronArryIdx === 4) {
      cronArryIdx = 0;
    }
    job.start();
    console.log(`${id} 로그인 완료`);
  }

};

main();
