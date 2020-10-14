const googleTrends = require("google-trends-api");
var express = require("express");
var cors = require("cors");
var app = express();
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

app.get("/:keyword/:keyword2", async (req, res) => {
	try {
		//console.log('reached')
		var result = [];
		var result2 = [];
		var result3 = [];
		googleTrends
			.interestOverTime({ keyword: req.params.keyword })
			.then(function (results) {
				// console.log((JSON.parse(results).default.timelineData[0]));
				JSON.parse(results).default.timelineData.map((data, i) => {
					result.push({ date: data.formattedTime, value: data.value[0] });
				});
			})
			.then(function () {
				googleTrends
					.interestOverTime({ keyword: req.params.keyword2 })
					.then(function (results) {
						// console.log((JSON.parse(results).default.timelineData[0]));
						JSON.parse(results).default.timelineData.map((data, i) => {
							result2.push({ date: data.formattedTime, value: data.value[0] });
						});
					})
					.then(function () {
						googleTrends.interestOverTime({ keyword: req.params.keyword + " " + req.params.keyword2 }).then(function (results) {
							// console.log((JSON.parse(results).default.timelineData[0]));
							JSON.parse(results).default.timelineData.map((data, i) => {
								result3.push({ date: data.formattedTime, value: data.value[0] });
							});
							var finalResponse = new Response({
								date: "Dates",
								keyword1: req.params.keyword,
								keyword2: req.params.keyword2,
								bothKeywords: req.params.keyword + " " + req.params.keyword2,
							});

							for (var i = 1; i < result.length; i++) {
								let data = {
									date: result[i - 1] && result[i - 1].date ? result[i - 1].date : "",
									keyword1: result[i - 1] && result[i - 1].value,
									keyword2: result2 && result2.length && result2[i - 1].value ? result2[i - 1].value : 0,
									bothKeywords: result3 && result3.length && result3[i - 1].value ? result3[i - 1].value : 0,
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
		var result = [];
		await googleTrends.dailyTrends({ geo: req.params.country }).then(function (results) {
			var arr = JSON.parse(results).default.trendingSearchesDays[0].trendingSearches;
			for (var i = 0; i < arr.length; i++) {
				result.push(arr[i].title.query);
			}
			res.json(result);
		});
		//res.json({'trend1':trend1,'trend2':trend2})
	} catch (err) {
		console.log(err);
	}
});
app.listen(process.env.PORT || "3001", function () {
	console.log("Server started on port " + process.env.PORT);
});
