const googleTrends = require("google-trends-api");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

class Response {
  constructor(pLabel) {
    this.label = pLabel;
    this.data = [];
  }

  addData(pDataObj) {
    this.data.push(pDataObj);
  }
}

app.get("/", async (req, res) => {
  res.json({ Ping: "Pong" });
});

app.get("/:keyword/:keyword2/:startDate", async (req, res) => {
  try {
    // console.log('reached')
    const result = [];
    const result2 = [];
    const result3 = [];
    const startDate = new Date(req.params.startDate);
    googleTrends
      .interestOverTime({ keyword: req.params.keyword, startTime: startDate })
      .then(function (results) {
        // console.log((JSON.parse(results).default.timelineData[0]));
        JSON.parse(results).default.timelineData.map((data, i) => {
          result.push({ date: data.formattedTime, value: data.value[0] });
        });
      })
      .then(function () {
        googleTrends
          .interestOverTime({
            keyword: req.params.keyword2,
            startTime: startDate,
          })
          .then(function (results) {
            // console.log((JSON.parse(results).default.timelineData[0]));
            JSON.parse(results).default.timelineData.map((data, i) => {
              result2.push({ date: data.formattedTime, value: data.value[0] });
            });
          })
          .then(function () {
            googleTrends
              .interestOverTime({
                keyword: `${req.params.keyword} ${req.params.keyword2}`,
                startTime: startDate,
              })
              .then(function (results) {
                // console.log((JSON.parse(results).default.timelineData[0]));
                JSON.parse(results).default.timelineData.map((data, i) => {
                  result3.push({
                    date: data.formattedTime,
                    value: data.value[0],
                  });
                });
                const finalResponse = new Response({
                  date: "Dates",
                  keyword1: req.params.keyword,
                  keyword2: req.params.keyword2,
                  bothKeywords: `${req.params.keyword} ${req.params.keyword2}`,
                });

                for (let i = 1; i < result.length; i++) {
                  const data = {
                    date:
                      result[i - 1] && result[i - 1].date
                        ? result[i - 1].date
                        : "",
                    keyword1: result[i - 1] && result[i - 1].value,
                    keyword2:
                      result2 && result2.length && result2[i - 1].value
                        ? result2[i - 1].value
                        : 0,
                    bothKeywords:
                      result3 && result3.length && result3[i - 1].value
                        ? result3[i - 1].value
                        : 0,
                  };
                  finalResponse.addData(data);
                }
                res.json(finalResponse);
              });
          });
      });
  } catch (err) {
    console.log(err);
  }
});
app.get("/:country", async (req, res) => {
  try {
    const result = [];
    await googleTrends
      .dailyTrends({ geo: req.params.country })
      .then(function (results) {
        const arr = JSON.parse(results).default.trendingSearchesDays[0]
          .trendingSearches;
        for (let i = 0; i < arr.length; i++) {
          result.push(arr[i].title.query);
        }
        res.json(result);
      });
    // res.json({'trend1':trend1,'trend2':trend2})
  } catch (err) {
    console.log(err);
  }
});
app.listen(process.env.PORT || "3001", function () {
  console.log(`Server started on port ${process.env.PORT || "3001"}`);
});
