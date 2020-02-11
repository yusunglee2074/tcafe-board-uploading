const puppeteer = require("puppeteer");
const CronJob = require('cron').CronJob;

const main = async () => {
  // 2분마다 P구해요 쿼리 치고 메모리에 저장되어있는 글 번호와 다르다면 메모리 업데이트, 메일 보내기

  // 브라우저 만들고 페이지 이동
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://tcafe2a.com/', {timeout: 100000});
  await page.waitForSelector('input[name="mb_id"]');
  await page.type('input[name="mb_id"]', 'lys20741');
  await page.type('input[name="mb_password"]', 'sjdmlrl4');
  await page.click('input[class="login-button"]');
  await page.on("dialog", dialog => {
    dialog.accept();
  });

  await page.goto('http://tcafe2a.com/', {timeout: 100000});






  const cron = makeCronJob();
  cron.start();


  return 0;
};

const makeCronJob = () => {
  return new CronJob('0 */2 * * * *', async () => {

  }, null, true, 'Asia/Tokyo');
};

const result = main();
