const puppeteer = require("puppeteer");
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'lys03331@gmail.com',
    pass: 'sjdmlrl4'
  }
});

let boardId = '';

const main = async () => {
  // 2분마다 P구해요 쿼리 치고 메모리에 저장되어있는 글 번호와 다르다면 메모리 업데이트, 메일 보내기

  // 브라우저 만들고 로그인
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

  console.log('시작시간', new Date);
  const cron = makeCronJob(page);
  cron.start();


  return 0;
};

const makeCronJob = page => {
  return new CronJob('0 */2 * * * *', async () => {
    const recentBoardId = await getRecentBoardId(page);
    if (boardId !== recentBoardId) {
      boardId = recentBoardId;
      // 메일 보내기
      const boardTitle = await page.$eval('table#tbl_board tbody tr:nth-child(6) td.l_subj span a span', e => e.innerText);
      console.log('새로운 글 등록!' ,boardTitle);
      const mailOptions = {
        from: 'lys03331@gmail.com',
        to: 'lys0333@gmail.com',
        subject: boardTitle,
        text: 'That was easy!'
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
  }, null, true, 'Asia/Tokyo');
};

const getRecentBoardId = async page => {
  await page.goto('http://tcafe2a.com/bbs/board.php?bo_table=need_point', {timeout: 100000});
  return await page.$eval('table#tbl_board tbody tr:nth-child(6) td.l_num', e => e.innerText);
};

const result = main();
