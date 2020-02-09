const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;

  (async () => {
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.goto('http://tcafe2a.com/');
    await page.waitForSelector('input[name="mb_id"]');
    await page.type('input[name="mb_id"]', 'lys20742');
    await page.type('input[name="mb_password"]', 'vLa4ivKFLVnWFKz');
    await page.click('input[class="login-button"]');
    // Add a wait for some selector on the home page to load to ensure the next step works correctly

    const job = new CronJob('2 8 */1 * * *', async () => {
      console.log('시작');
      for (let i = 0; i < 10; i++) {
        await page.waitFor(2000);
        const {title, content} = await getTitleAndContent(page, 'cook');
        await writeBoard(page, 'cook', title, content);
      }
      for (let i = 0; i < 10; i++) {
        await page.waitFor(2000);
        const {title, content} = await getTitleAndContent(page, 'jjal');
        await writeBoard(page, 'jjal', title, content);
      }
      for (let i = 0; i < 10; i++) {
        await page.waitFor(2000);
        const {title, content} = await getTitleAndContent(page, 'gongpo');
        await writeBoard(page, 'gongpo', title, content);
      }
      for (let i = 0; i < 10; i++) {
        await page.waitFor(2000);
        const {title, content} = await getTitleAndContent(page, 'humor');
        await writeBoard(page, 'humor', title, content);
      }
    }, null, true, 'America/Los_Angeles');
    job.start();

  })();




const getTitleAndContent = async (page, boardName) => {
  const randomInt = (low, high) => {
    return Math.floor(Math.random() * (high - low) + low)
  };
  const url = boardUrl[boardName] + randomInt(80, 120);
  await page.goto(url);
  let boardId;
  let title;
  const randomNum = randomInt(5, 50);
  if (boardName !== 'talkCafe') {
    boardId = await page.$eval(`table#tbl_board tbody tr:nth-child(${randomNum}) td.l_num`, e => e.innerText);
    title = await page.$eval(`table#tbl_board tbody tr:nth-child(${randomNum}) td.l_subj a span`, e => e.innerText);
  } else {
    boardId = await page.$eval(`table#tbl_board tbody tr:nth-child(${randomNum}) td.l_num`, e => e.innerText);
    title = await page.$eval(`table#tbl_board tbody tr:nth-child(${randomNum}) td.l_subj a span`, e => e.innerText);
  }
  await page.goto(url + '&wr_id=' + boardId);

  if (title[0] === '[') title = title.slice(5);
  const content = await page.$eval('div#view_' + boardId, e => e.innerHTML);

  return {title, content};
};

const writeBoard = async (page, boardName, title, content) => {
  await page.goto(boardWriteUrl[boardName]);
  await page.type('input[id="wr_subject"]', title);
  await page.click('div[class="cheditor-tab-code-off"]');
  await page.type('textarea[class="cheditor-editarea-text-content"]', content);
  if (boardName !== 'talkCafe') {
    await page.evaluate(() => {
      document.querySelector('select option:nth-child(2)').selected = true;
    })
  }

  await page.click('input[id="btn_submit"]');
};

const boardUrl = {
  cook: 'http://tcafe2a.com/bbs/board.php?bo_table=c_food&page=',
  gongpo: 'http://tcafe2a.com/bbs/board.php?bo_table=c_gongpo&page=',
  humor: 'http://tcafe2a.com/bbs/board.php?bo_table=c_humor&page=',
  jjal: 'http://tcafe2a.com/bbs/board.php?bo_table=c_jjalbang&page=',
};
const boardWriteUrl = {
  cook: 'http://tcafe2a.com/bbs/write.php?bo_table=c_food',
  gongpo: 'http://tcafe2a.com/bbs/write.php?bo_table=c_gongpo',
  humor: 'http://tcafe2a.com/bbs/write.php?bo_table=c_humor',
  jjal: 'http://tcafe2a.com/bbs/write.php?bo_table=c_jjalbang',
};

