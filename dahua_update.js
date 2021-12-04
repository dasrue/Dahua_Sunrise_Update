const https = require("https");
const http = require("http");
const crypto = require('crypto');

const lat = "-36.8";
const lng = "174.6";
const cams =	[	{addr:"192.168.1.108", user:"admin", pass:"1234567a"},
					{addr:"192.168.1.109", user:"admin", pass:"1234567a"}	];


function dahuaGetLoginSession(addr, user, pass, donefunc, errfunc) {
	const firstID = (Math.floor(Math.random() * 1000));
	const login1data = JSON.stringify({
		method: "global.login",
		params: {
			userName: user,
			password: "",
			clientType: "Web3.0",
			loginType: "Direct"
		},
		id: firstID
	})
	const login1options = {
		hostname: addr,
		port: 80,
		path: "/RPC2_Login",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": login1data.length
		}
	}
	const login1req = http.request(login1options, (resp) => {
		let data = "";
		
		// A chunk of data has been received.
		resp.on("data", (chunk) => {
			data += chunk;
		});
		
		// The whole response has been received. Process the result.
		resp.on("end", () => {
			var json_resp = JSON.parse(data);
			var hasha = crypto.createHash('md5').update(user + ":" + json_resp.params.realm + ":" + pass).digest('hex').toUpperCase();
			var hashb = crypto.createHash('md5').update(user + ":" + json_resp.params.random + ":" + hasha).digest('hex').toUpperCase();
			//console.log("Login stage 1 for " + addr + ", hashA = " + hasha + " hashB = " + hashb);
			const login2data = JSON.stringify({
				method: "global.login",
				params: {
					userName: user,
					password: hashb,
					clientType: "Web3.0",
					loginType: "Direct",
					authorityType: "Default"
				},
				id: firstID + 1,
				session: json_resp.session
			})
			const login2options = {
				hostname: addr,
				port: 80,
				path: "/RPC2_Login",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"Content-Length": login2data.length
				}
			}
			const login2req = http.request(login2options, (resp) => {
				let datab = "";
		
				// A chunk of data has been received.
				resp.on("data", (chunk) => {
					datab += chunk;
				});
			
				// The whole response has been received. Process the result.
				resp.on("end", () => {
					var json_respb = JSON.parse(datab);
					donefunc(addr, user, json_respb.session);
				});
			}).on("error", (err) => {
				errfunc(addr, err.message);
			});
			
			login2req.write(login2data);
			login2req.end();
		});
	}).on("error", (err) => {
		errfunc(addr, err.message);
	});

	login1req.write(login1data);
	login1req.end();
}

console.log("Getting sunrise data from server...");
https.get("https://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + lng + "&formatted=0", (resp) => {
	let data = "";

	// A chunk of data has been received.
	resp.on("data", (chunk) => {
		data += chunk;
	});

	// The whole response has been received. Process the result.
	resp.on("end", () => {
		var json_resp = JSON.parse(data);
		if(json_resp.status === "OK") {
			var tw_begin = new Date(json_resp.results.civil_twilight_begin);
			var tw_end = new Date(json_resp.results.civil_twilight_end);
			var range_str = tw_begin.getHours() + ":" + tw_begin.getMinutes() + ":00-" + tw_end.getHours() + ":" + tw_end.getMinutes() + ":00";
			console.log("OK! New range: " + range_str);
			
			// Update cameras
			cams.forEach(function(cam){
				//console.log("Test: " + cam.addr);
				// Get login challenge
				dahuaGetLoginSession(cam.addr, cam.user, cam.pass, (thisaddr, thisuser, thissession) => {
					const dahuaSunriseData = JSON.stringify({
						method: "configManager.setConfig",
						params: {
							name: "VideoInMode",
							table: [
								{
									Config: [0, 1],
									Mode: 1,
									TimeSection: [
										[
											"1 " + range_str,
											"0 00:00:00-00:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00"
										],
										[
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00"
										],
										[
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00"
										],
										[
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00"
										],
										[
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00"
										],
										[
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00"
										],
										[
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00",
											"0 00:00:00-24:00:00"
										]
									]
								}
							],
							options: []
						},
						id: (Math.floor(Math.random() * 1000)),
						session: thissession
					});
					const dahuaSunriseOptions = {
						hostname: thisaddr,
						port: 80,
						path: "/RPC2",
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
							"Content-Length": dahuaSunriseData.length,
							"Cookie": "secure; username=" + thisuser + "; DWebClientSessionID=" + thissession
						}
					};
					const dahuaSunriseReq = http.request(dahuaSunriseOptions, (dahuaSunriseResp) => {
						let dahuaSunriseRespData = "";
		
						// A chunk of data has been received.
						dahuaSunriseResp.on("data", (chunk) => {
							dahuaSunriseRespData += chunk;
						});
						
						// The whole response has been received. Process the result.
						dahuaSunriseResp.on("end", () => {
							var dahuaSunriseRespJSON = JSON.parse(dahuaSunriseRespData);
							console.log("Set sunrise data for " + thisaddr + ((dahuaSunriseRespJSON.result == true) ? " successfully!" : " failed."));
						});
					});
					dahuaSunriseReq.write(dahuaSunriseData);
					dahuaSunriseReq.end();
				},(thisaddr, errmsg) => {
					console.log("Error " + errmsg + " on " + thisaddr);
				});
			});
			
			
		}
	});

}).on("error", (err) => {
	console.log("Error: " + err.message);
});

