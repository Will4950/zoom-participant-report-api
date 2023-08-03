import axios from 'axios';

const zoomAuth = 'https://zoom.us/oauth/';
const zoomAPI = 'https://api.zoom.us/v2/';

export async function getAccessToken() {
	try {
		let oauthToken = Buffer.from(
			`${process.env.clientID}:${process.env.clientSecret}`
		).toString('base64');

		let res = await axios({
			method: 'post',
			url: `${zoomAuth}token?grant_type=account_credentials&account_id=${process.env.accountID}`,
			headers: {Authorization: `Basic ${oauthToken}`}
		});
		return res.data.access_token;
	} catch (e) {
		return false;
	}
}

export async function getPastWebinars(accessToken, webinars, token) {
	let yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1))
		.toJSON()
		.slice(0, 10);
	let currentDate = new Date().toJSON().slice(0, 10);
	try {
		let res = await axios({
			method: 'get',
			url: `${zoomAPI}/metrics/webinars`,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			params: {
				type: 'past',
				from: yesterdayDate,
				to: currentDate,
				page_size: 300,
				next_page_token: token ? token : null
			}
		});
		webinars = webinars.concat(res.data.webinars);
		if (res.data.next_page_token) {
			return await getPastWebinars(
				accessToken,
				webinars,
				res.data.next_page_token
			);
		} else {
			return webinars;
		}
	} catch (e) {
		return false;
	}
}

export async function getParticipantReport(
	accessToken,
	webinarID,
	participants,
	token
) {
	try {
		let res = await axios({
			method: 'get',
			url: `${zoomAPI}report/webinars/${webinarID}/participants`,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			params: {
				page_size: 300,
				next_page_token: token ? token : null
			}
		});
		participants = participants.concat(res.data.participants);
		if (res.data.next_page_token) {
			return await getParticipantReport(
				accessToken,
				webinarID,
				participants,
				res.data.next_page_token
			);
		} else {
			return participants;
		}
	} catch (e) {
		return false;
	}
}
